#!/usr/bin/env python3
#
###############################################################################
#   Copyright (C) 2022 Jean-Michel Cohen, F4JDN <f4jdn@outlook.fr>
#
#   This program is free software; you can redistribute it and/or modify
#   it under the terms of the GNU General Public License as published by
#   the Free Software Foundation; either version 3 of the License, or
#   (at your option) any later version.
#
#   This program is distributed in the hope that it will be useful,
#   but WITHOUT ANY WARRANTY; without even the implied warranty of
#   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#   GNU General Public License for more details.
#
#   You should have received a copy of the GNU General Public License
#   along with this program; if not, write to the Free Software Foundation,
#   Inc., 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301  USA

# Standard modules
import json
import logging
import time as ptime
import datetime
import base64
import urllib
import platform
import os
import binascii
import sys

from urllib import parse

from itertools import islice
from ssl import SSL_ERROR_WANT_X509_LOOKUP
from subprocess import check_call, CalledProcessError
from wsgiref.util import request_uri

# Twisted modules
from twisted.internet.protocol import ReconnectingClientFactory
from twisted.protocols.basic import NetstringReceiver, FileSender
from twisted.internet import reactor, endpoints, task, defer
from twisted.web.server import Site
from twisted.web import http
from twisted.web.client import URI
from twisted.web.resource import Resource, NoResource
from twisted.web.static import File
from twisted.web import server
from twisted.web.server import Session
from twisted.python.url import URL
from twisted.python.components import registerAdapter
from zope.interface import Interface, Attribute, implementer

# Autobahn provides websocket service under Twisted
from autobahn.twisted.websocket import WebSocketServerProtocol, WebSocketServerFactory
from autobahn.websocket.compress import *

# Specific functions to import from standard modules
from time import time, strftime, localtime
from pickle import loads
from binascii import b2a_hex as h
from os.path import getmtime

# Configuration variables and constants
from config import *

# SP2ONG - Increase the value if HBlink link break occurs
NetstringReceiver.MAX_LENGTH = 500000000

LOGINFO = False

# Configuration variables and constants
from config import *

# https://stackoverflow.com/questions/182197/how-do-i-watch-a-file-for-changes

CONFIG              = {}
LASTHEARDSIZE       = LAST_HEARD_SIZE
TRAFFICSIZE         = TRAFFIC_SIZE
WATCH_FILE          = ""
CTABLEJ             = ""
MESSAGEJ            = []
LISTENERSJ          = []
BUTTONBAR_HTML      = ""
FILE_HAS_CHANGED    = False

def createLogTableJson():
  with open(WATCH_FILE, 'r') as file:
    Lines = file.readlines()
    REPORT_COUNT = 0

    MESSAGEJ = []

    # Strips the newline character
    for line in Lines:
        REPORT_COUNT += 1
        p = line.split("%")

        REPORT_SRC_ID       = p[0]
        REPORT_ROOM         = p[1]
        REPORT_CALLSIGN     = p[2]
        REPORT_DATETIME     = p[3]

        REPORT_PORT         = p[4]
        REPORT_DATA1        = p[5]
        REPORT_LONLAT       = p[6]
        REPORT_DATA2        = p[7]
        REPORT_DATA3        = p[8]
        REPORT_DATA4        = p[9]
        REPORT_DATA5        = p[10]
        REPORT_DATA6        = p[11]
        REPORT_DATA7        = p[12]

        REPORT_DATE = p[3][:10].strip()
        REPORT_TIME = p[3][11:].strip()

        MESSAGEJ.append({ 'ORDER': REPORT_COUNT, 'DATE': REPORT_DATE, 'TIME': REPORT_TIME, 'PORT': REPORT_PORT, 'SRC_ID': REPORT_SRC_ID, 'ROOM': REPORT_ROOM, 'CALLSIGN': REPORT_CALLSIGN, 'LOCATION': REPORT_LONLAT })

  return MESSAGEJ

# Call this function each time a change happens
def fileHasChanged(text):
    global FILE_HAS_CHANGED

    # print(text)
    MESSAGEJ = createLogTableJson()

    with open(LOG_PATH + "WiresAccess.json", 'r+') as file:
        file.seek(0)
        # keep only the N last
        json.dump({ "TRAFFIC" : MESSAGEJ[-LASTHEARDSIZE:] }, file, indent=4)
        file.truncate()

    FILE_HAS_CHANGED = True

class Watcher(object):
    running = True
    refresh_delay_secs = 0.25

    # Constructor
    def __init__(self, watch_file, call_func_on_change=None, *args, **kwargs):
        self._cached_stamp = 0
        self.filename = watch_file
        self.call_func_on_change = call_func_on_change
        self.args = args
        self.kwargs = kwargs

    # Look for changes
    def look(self):
        stamp = os.stat(self.filename).st_mtime
        if stamp != self._cached_stamp:
            self._cached_stamp = stamp
            # print('File changed')
            if self.call_func_on_change is not None:
                self.call_func_on_change(*self.args, **self.kwargs)

    # Keep watching in a loop
    def watch(self):
        try: 
            # Look for changes
            ptime.sleep(self.refresh_delay_secs)
            self.look() 
        except FileNotFoundError:
            # Action on file not found
            pass
        except: 
            print('Unhandled error: %s' % sys.exc_info()[0])

######################################################################
#
# BUILD HBlink AND CONFBRIDGE TABLES FROM CONFIG/BRIDGES DICTS
#          THIS CURRENTLY IS A TIMED CALL
#
build_time = time()

def build_stats():
    global build_time, LISTENERSJ, FILE_HAS_CHANGED
    now = time()

    if True and 'dashboard_server' in locals() or 'dashboard_server' in globals(): #now > build_time + 2:
        for client in dashboard_server.clients:
            if client.page == "dashboard":
                watcher.watch()
                if FILE_HAS_CHANGED:
                    INITIALLIST = []

                    with open(LOG_PATH + "WiresAccess.json", 'r') as infile:
                        _traffic = json.load(infile)

                        if _traffic and _traffic["TRAFFIC"]:
                            INITIALLIST = reversed(_traffic["TRAFFIC"]) 

                    CTABLEJ = { "TRAFFIC": sorted(INITIALLIST, key=lambda k: (k["DATE"]+" "+k["TIME"]), reverse=True)[:TRAFFICSIZE], 'BIGEARS': str(len(dashboard_server.clients)), 'LISTENERS': LISTENERSJ }
                    client.sendMessage(json.dumps(CTABLEJ, ensure_ascii = False).encode('utf-8'))

        build_time = now
        FILE_HAS_CHANGED = False

def timeout_clients():
    now = time()
    try:
        for client in dashboard_server.clients:
            if dashboard_server.clients[client] + CLIENT_TIMEOUT < now:
                logger.info('TIMEOUT: disconnecting client %s', dashboard_server.clients[client])
                try:
                    dashboard.sendClose(client)
                except Exception as e:
                    logger.error('Exception caught parsing client timeout %s', e)
    except:
        logger.info('CLIENT TIMEOUT: List does not exist, skipping. If this message persists, contact the developer')

# For importing HTML templates
def get_template(_file):
    with open(_file, 'r') as html:
        return html.read()

def creation_date(path_to_file):
    """
    Try to get the date that a file was created, falling back to when it was
    last modified if that isn't possible.
    See http://stackoverflow.com/a/39501288/1709587 for explanation.
    """
    if platform.system() == 'Windows':
        return os.path.getctime(path_to_file)
    else:
        stat = os.stat(path_to_file)
        try:
            return stat.st_birthtime
        except AttributeError:
            # We're probably on Linux. No easy way to get creation dates here,
            # so we'll settle for when its content was last modified.
            return stat.st_mtime

def replaceSystemStrings(data):
    return data.replace("<<<site_logo>>>", sitelogo_html).replace("<<<system_name>>>", REPORT_NAME) \
        .replace("<<<button_bar>>>", BUTTONBAR_HTML) \
        .replace("<<<TGID_HILITE>>>", str(TGID_HILITE)) \
        .replace("<<<SOCKET_SERVER_PORT>>>", str(SOCKET_SERVER_PORT)) \
        .replace("<<<DISPLAY_LINES>>>", str(DISPLAY_LINES)) # \ .replace("class=\"theme-dark\"", "class=\"theme-light\"")

private_secret = os.urandom(64)

def generateRandomSessionKey():
    session_key = binascii.hexlify(os.urandom(16))
    return session_key

def load_dictionary(_message):
    data = _message[1:]
    logging.debug('Successfully decoded dictionary')
    return loads(data)

######################################################################
#
# WEBSOCKET COMMUNICATION WITH THE DASHBOARD CLIENT
#
class dashboard(WebSocketServerProtocol):
    def onConnect(self, request):        
        logging.info('Client connecting: %s', request.peer)
        if 'page' in request.params:
            self.page = request.params["page"][0]
            logging.info('Client Page: %s', self.page)
        else:
            self.page = ""

    def onOpen(self):
        logging.info('WebSocket connection open.')
        self.factory.register(self)

        _message = {}

        _message["PACKETS"] = {}
        _message["BIGEARS"] = str(len(dashboard_server.clients))
        _message["LISTENERS"] = LISTENERSJ

        watcher.watch()  # start the watch

        INITIALLIST = []

        # read saved history or create traffic file for later
        if os.path.exists(LOG_PATH + "WiresAccess.json"):
            with open(LOG_PATH + "WiresAccess.json", 'r') as infile:
                _traffic = json.load(infile)

                if _traffic and _traffic["TRAFFIC"]:
                    INITIALLIST = reversed(_traffic["TRAFFIC"]) 
                else:
                    logging.info("Creating empty " + LOG_PATH + "WiresAccess.json")
                    with open(LOG_PATH + "WiresAccess.json", 'w') as outfile:
                        json.dump({ "TRAFFIC" : [] }, outfile)
        else:
            logging.info("Creating empty " + LOG_PATH + "WiresAccess.json")
            with open(LOG_PATH + "WiresAccess.json", 'w') as outfile:
                json.dump({ "TRAFFIC" : [] }, outfile)

        # sorted in reverse order last in log becomes first to display
        # https://linuxhint.com/sort-json-objects-python/
        _message["PACKETS"] = { "TRAFFIC": sorted(INITIALLIST, key=lambda k: (k["DATE"]+" "+k["TIME"]), reverse=True)[:TRAFFICSIZE] }

        self.sendMessage(json.dumps({ "CONFIG": _message }, ensure_ascii = False).encode('utf-8'))

        logger.info('Deleting INITIALLIST after init')
        del _message
        del INITIALLIST

    def connectionLost(self, reason):
        WebSocketServerProtocol.connectionLost(self, reason)
        self.factory.unregister(self)
        
    def onClose(self, wasClean, code, reason):
        logging.info('WebSocket connection closed: %s', reason)

class dashboardFactory(WebSocketServerFactory):
    def __init__(self, url):
        WebSocketServerFactory.__init__(self, url)
        self.clients = {}

    def register(self, client):
        if client not in self.clients:
            logging.info('registered client %s', client.peer)
            self.clients[client] = time()

    def unregister(self, client):
        if client in self.clients:
            logging.info('unregistered client %s', client.peer)
            del self.clients[client]

    def broadcast(self, msg):
        logging.debug('broadcasting message to: %s', self.clients)
        for c in self.clients:
            c.sendMessage(json.dumps(msg, ensure_ascii = False).encode('UTF-8'))
            logging.debug('message sent to %s', c.peer)

######################################################################
#
# STATIC WEBSERVER
#
class staticHtmlFile(Resource):
    def __init__(self, file_Name, file_Folder, file_contentType):
        self.file_Name = file_Name
        self.file_Folder = file_Folder
        self.file_contentType = file_contentType
        Resource.__init__(self)

    def render_GET(self, request):
        filepath = "{}/{}".format(PATH + self.file_Folder, self.file_Name.decode("UTF-8"))

        if os.path.exists(filepath):
            request.setHeader('content-disposition', 'filename=' + self.file_Name.decode("UTF-8"))
            request.setHeader('content-type', self.file_contentType)
            return replaceSystemStrings(get_template(filepath)).encode("utf-8")

        request.setResponseCode(http.NOT_FOUND)
        request.finish()
        return NoResource()

class staticFile(Resource):
    def __init__(self, file_Name, file_Folder, file_contentType):
        self.file_Name = file_Name
        self.file_Folder = file_Folder
        self.file_contentType = file_contentType
        Resource.__init__(self)

    def render_GET(self, request):
        @defer.inlineCallbacks
        def _feedfile():
            if self.file_Folder != "/tmp":
                filepath = "{}/{}".format(PATH + self.file_Folder, self.file_Name.decode("UTF-8"))
            else:
                filepath = "{}/{}".format(self.file_Folder, self.file_Name.decode("UTF-8"))

            self.file_size = os.path.getsize(filepath)

            logging.info(filepath)

            @defer.inlineCallbacks
            def _setContentDispositionAndSend(file_path, file_name, content_type):
                request.setHeader('content-disposition', 'filename=' + file_name.decode("UTF-8"))
                request.setHeader('content-length', str(self.file_size))
                request.setHeader('content-type', content_type)

                with open(file_path, 'rb') as f:
                    yield FileSender().beginFileTransfer(f, request)
                    f.close()

                defer.returnValue(0)

            if os.path.exists(filepath):
                yield _setContentDispositionAndSend(filepath, self.file_Name, self.file_contentType)
            else:
                request.setResponseCode(http.NOT_FOUND)
            
            request.finish()

            defer.returnValue(0)

        _feedfile()
        return server.NOT_DONE_YET

class IAuthenticated(Interface):
    mode = Attribute("A value 0 or 1 meaning User or Admin")
    value = Attribute("A boolean indicating session has been authenticated")

@implementer(IAuthenticated)
class Authenticated(object):
    def __init__(self, session):
        self.value = False
        self.mode = 0

registerAdapter(Authenticated, Session, IAuthenticated)

def index_template():
    return replaceSystemStrings(get_template(PATH + "templates/index_template.html")).encode('utf-8')

class web_server(Resource):
    def __init__(self):
        Resource.__init__(self)

    def getChild(self, name, request):
        session = request.getSession()
        authenticated = IAuthenticated(session)
        if authenticated.value != True:
            return self

        page = name.decode("utf-8")

        if page == '' or page == 'index.html':
            return self

        # deal with static files (images, css etc...)
        # call static file with file name, location folder, controlType
        #
        if page.endswith(".html") or page.endswith(".htm"):
            return staticHtmlFile(name, "html", "text/html; charset=utf-8")
        if page.endswith(".css"):
            return staticFile(name, "css", "text/css; charset=utf-8")
        elif page.endswith(".js"):
            return staticFile(name, "scripts", "application/javascript; charset=utf-8")
        elif page.endswith(".jpg") or page.endswith(".jpeg"):
            return staticFile(name, "images", "image/jpeg")
        elif page.endswith(".gif"):
            return staticFile(name, "images", "image/gif")
        elif page.endswith(".png"):
            return staticFile(name, "images", "image/png")
        elif page.endswith(".svg"):
            return staticFile(name, "images", "image/svg+xml")
        elif page.endswith(".ico"):
            return staticFile(name, "images", "image/x-icon")
        elif page.endswith(".json"):
            return staticFile(name, "assets", "application/json")
        elif page.endswith(".txt"):
            return staticFile(name, "html", "text/plain")
        elif page.endswith(".woff2"):
            return staticFile(name, "webfonts", "font/woff2;")
        elif page.endswith(".woff"):
            return staticFile(name, "webfonts", "font/woff;")
        elif page.endswith(".ttf"):
            return staticFile(name, "webfonts", "font/ttf;")

        return NoResource()

    def render_GET(self, request):
        admin_auth = False
        logging.info('static website requested: %s', request)
        session = request.getSession()
        authenticated = IAuthenticated(session)

        url = URL.fromText(request.uri.decode('ascii'))
        if len(url.get("admin")) > 0:
            admin_auth = True

        if WEB_AUTH or admin_auth:
            admin_login = ADMIN_USER.encode('utf-8')
            admin_password = ADMIN_PASS.encode('utf-8')

            user = WEB_USER.encode('utf-8')
            password = WEB_PASS.encode('utf-8')

            auth = request.getHeader('Authorization')
            if auth and auth.split(' ')[0] == 'Basic':
                decodeddata = base64.b64decode(auth.split(' ')[1])
                if (decodeddata.split(b':') == [user, password] and not admin_auth) or (decodeddata.split(b':') == [admin_login, admin_password] and admin_auth):
                    global BUTTONBAR_HTML

                    logging.info('Authorization OK')
                    authenticated.value = True
                    if decodeddata.split(b':') == [user, password]:
                        authenticated.mode = 0
                        # update button bar template
                        logging.info('user logging, switching to user menu')
                        BUTTONBAR_HTML = get_template(PATH + "templates/buttonbar.html")
                    else:
                        authenticated.mode = 1
                        # update button bar template
                        logging.info('admin logging, switching to admin menu')
                        BUTTONBAR_HTML = get_template(PATH + "templates/admin_buttonbar.html")

                    return index_template()

            authenticated.value = False
            authenticated.mode = 0
            request.setResponseCode(http.UNAUTHORIZED)
            request.setHeader('www-authenticate', 'Basic realm="realmname"')
            logging.info('Someone wanted to get access without authorization')

            return "<html<head></hread><body style=\"background-color: #EEEEEE;\"><br><br><br><center> \
                    <fieldset style=\"width:600px;background-color:#e0e0e0e0;text-algin: center; margin-left:15px;margin-right:15px; \
                     font-size:14px;border-top-left-radius: 10px; border-top-right-radius: 10px; \
                     border-bottom-left-radius: 10px; border-bottom-right-radius: 10px;\"> \
                  <p><font size=5><b>Authorization Required</font></p></filed></center></body></html>".encode('utf-8')
        else:
            authenticated.value = True
            authenticated.mode = 0
            return index_template()

if __name__ == '__main__':
    logging.basicConfig(
        level=logging.INFO,
        filename = (LOG_PATH + LOG_NAME),
        filemode='a',
        format='%(asctime)s %(levelname)s %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    console = logging.StreamHandler()
    console.setLevel(logging.INFO)
    formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
    console.setFormatter(formatter)
    logging.getLogger('').addHandler(console)
    logger = logging.getLogger(__name__)

    logging.info('wxmonitor.py starting up')

    logger.info('\n\n\tWXJSON v1.1.0:\n\tCopyright (c) 2022 Jean-Michel Cohen, F4JDN <f4jdn@outlook.fr>\n\n')

    # Check WiresAccess.log file
    # if os.path.isfile(LOG_PATH+"WiresAccess.log"):
    #   try:
    #      check_call("sed -i -e 's|\\x0||g' {}".format(LOG_PATH+"WiresAccess.log"), shell=True)
    #      logging.info('Check WiresAccess.log file')
    #   except CalledProcessError as err:
    #      print(err)

    WATCH_FILE = WXLOG_FILE
    # watcher = Watcher(watch_file)  # simple
    watcher = Watcher(WATCH_FILE, fileHasChanged, text='updating json')  # also call custom action function
    
    # Create Static Website index file
    sitelogo_html = get_template(PATH + "templates/sitelogo.html")
    BUTTONBAR_HTML = get_template(PATH + "templates/buttonbar.html")

    # Start update loop
    update_stats = task.LoopingCall(build_stats)
    update_stats.start(FREQUENCY)

    # Start a timeout loop
    if CLIENT_TIMEOUT > 0:
        timeout = task.LoopingCall(timeout_clients)
        timeout.start(10)

    # Create websocket server to push content to clients
    dashboard_server = dashboardFactory('ws://*:{}'.format(SOCKET_SERVER_PORT))
    dashboard_server.protocol = dashboard

    # Function to accept offers from the client ..
    def accept(offers):
        for offer in offers:
            if isinstance(offer, PerMessageDeflateOffer):
                return PerMessageDeflateOfferAccept(offer)

    dashboard_server.setProtocolOptions(perMessageCompressionAccept=accept)

    reactor.listenTCP(SOCKET_SERVER_PORT, dashboard_server)

    # Create static web server to push initial index.html
    root = web_server()
    factory = Site(root)
    endpoint = endpoints.TCP4ServerEndpoint(reactor, JSON_SERVER_PORT)
    endpoint.listen(factory)

    reactor.run()
