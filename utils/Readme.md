Requirements webserver with activated PHP (apache, nginx or whatever) – PHP 7.x is ok

Extension of hbmonitor  – we log if a call is ended (I think it’s better as start) Please check permissions for writing the logfile in target folder !

I recommed to shorten the lastheard.log from time to time (I cut every day to 150 lines, longer values maybe extend the load time and parsing) with this script WiresAccess:

    #!/bin/bash
    mv /opt/WXJson/log/WiresAccess.log /opt/WXJson/log/WiresAccess.log.save
    /usr/bin/tail -150 /opt/WXJson/log/WiresAccess.log.save > /opt/WXJson/log/WiresAccess.log
    mv /opt/WXJson/log/WiresAccess.log /opt/WXJson/log/WiresAccess.log.save
    /usr/bin/tail -150 /opt/WXJson/log/WiresAccess.log.save > /opt/WXJson/log/WiresAccess.log


Call this script with crontab for everyday use.

Put this file in /etc/cron.daily/ and add attribute:
chmod +x /etc/cron.daily/WiresAccess

Call the website with http://YOUR_HOST/log.php it runs with a refresh/reload time of 30sec, change the script for other timeset.


73 jmc F4JDN

