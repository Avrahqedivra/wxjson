REPORT_NAME     = "WXJSON Monitor for WIRESX"   # Name of the monitored WiresX system
#
CONFIG_INC      = True                          # Include HBlink stats
HOMEBREW_INC    = True                          # Display Homebrew Peers status
LASTHEARD_INC   = True                          # Display lastheard table on main page
BRIDGES_INC     = True                          # Display Bridge status and button
EMPTY_MASTERS   = False                         # Display (True) or not (False) empty master in status

FREQUENCY       = 5                             # Frequency to push updates to web clients
SOCKET_SERVER_PORT = 9004                       # Websocket server for realtime monitoring
JSON_SERVER_PORT = 7770                         # Has to be above 1024 if you're not running as root
DISPLAY_LINES =  10                             # number of lines displayed in index_template
CLIENT_TIMEOUT  = 0                             # Clients are timed out after this many seconds, 0 to disable

# TG to hilite
TGID_HILITE = ""

# Authorization of access to dashboard as admin
ADMIN_USER = 'admin'
ADMIN_PASS = 'admin'

# Authorization of access to dashboard# as user
WEB_AUTH =  False
WEB_USER =  'admin'
WEB_PASS =  'admin'

# Max lines in lastactive table
LAST_ACTIVE_SIZE = 0

# Lastheard file size
LAST_HEARD_SIZE = 2000
# Nb lines in first packet sent to dashboard
TRAFFIC_SIZE    = 500

# Files and stuff for loading alias files for mapping numbers to names
PATH            = './'                           # MUST END IN '/'
FILE_RELOAD     = 1                              # Number of days before we reload DMR-MARC database files

# Settings for log files
LOG_PATH        = './log/'                       # MUST END IN '/'
LOG_NAME        = 'wxmon.log'

# Settings for wxlog files
WXLOG_FILE      = './log/WiresAccess.log'
