///IPs for this server:
66.11.122.60

#!
cd /
echo "search wedobusinessbetter.com" >> /etc/resolv.conf 
echo "nameserver 66.11.122.60" >> /etc/resolv.conf 
adduser jer

adduser jer sudo
su jer
cd ~
sudo apt-get update

sudo apt-get install software-properties-common python-software-properties nano vsftpd curl git
sudo apt-get update

sudo apt-get dist-upgrade

sudo nano /etc/ssh/sshd_config

### Set up FTP users &&& OPTIONAL &&& ###
sudo cp /etc/vsftpd.conf /etc/vsftpd.conf.original
sudo nano /etc/vsftpd.conf
sudo service vsftpd restart

#beginning tutorial found here: https://www.digitalocean.com/community/tutorials/how-to-secure-haproxy-with-let-s-encrypt-on-ubuntu-14-04
sudo apt-get -y install git bc
sudo git clone https://github.com/letsencrypt/letsencrypt /opt/letsencrypt
sudo service apache2 stop
#check if port 80 is open! The following command must return nothing.
netstat -plantu | grep ':80.*LISTEN'
#if empty...
cd /opt/letsencrypt
./letsencrypt-auto certonly --standalone
### SSL files are created at /etc/letsencrypt/live/**domainname**
sudo ls /etc/letsencrypt/live/wedobusinessbetter.com
sudo mkdir -p /etc/haproxy/certs
DOMAIN='wedobusinessbetter.com' sudo -E bash -c 'cat /etc/letsencrypt/live/$DOMAIN/fullchain.pem /etc/letsencrypt/live/$DOMAIN/privkey.pem > /etc/haproxy/certs/$DOMAIN.pem'
sudo chmod -R go-rwx /etc/haproxy/certs
sudo apt-get update

##     HA  Proxy     ##
sudo apt-get install haproxy
sudo cp /etc/haproxy/haproxy.cfg /etc/haproxy/haproxy.cfg.bakup
sudo rm /etc/haproxy/haproxy.cfg
sudo nano /etc/haproxy/haproxy.cfg
# add the following: (Must replace those sections with "bind")
global
        log /dev/log    local0
        log /dev/log    local1 notice
        chroot /var/lib/haproxy
        stats socket /run/haproxy/admin.sock mode 660 level admin
        stats timeout 30s
        user haproxy
        group haproxy
        daemon
        maxconn 2048
        tune.ssl.default-dh-param 2048

        # Default SSL material locations
        ca-base /etc/ssl/certs
        crt-base /etc/ssl/private

        # Default ciphers to use on SSL-enabled listening sockets.
        # For more information, see ciphers(1SSL). This list is from:
        #  https://hynek.me/articles/hardening-your-web-servers-ssl-ciphers/
        ssl-default-bind-ciphers ECDH+AESGCM:DH+AESGCM:ECDH+AES256:DH+AES256:ECDH+AES128:DH+AE$
        ssl-default-bind-options no-sslv3

defaults
        log     global
        mode    http
        option  httplog
        option  dontlognull
        timeout connect 5000
        timeout client  50000
        timeout server  50000
        errorfile 400 /etc/haproxy/errors/400.http
        errorfile 403 /etc/haproxy/errors/403.http
        errorfile 408 /etc/haproxy/errors/408.http
        errorfile 500 /etc/haproxy/errors/500.http
        errorfile 502 /etc/haproxy/errors/502.http
        errorfile 503 /etc/haproxy/errors/503.http
        errorfile 504 /etc/haproxy/errors/504.http

        option forwardfor
        option http-server-close

frontend www-http
   bind 66.11.122.60:80
   reqadd X-Forwarded-Proto:\ http
   default_backend www-backend

frontend www-https
   bind 66.11.122.60:443 ssl crt /etc/haproxy/certs/wedobusinessbetter.com.pem
   reqadd X-Forwarded-Proto:\ https
   acl letsencrypt-acl path_beg /.well-known/acme-challenge/
   use_backend letsencrypt-backend if letsencrypt-acl
   default_backend www-backend

backend www-backend
   redirect scheme https if !{ ssl_fc }
   server www-1 127.0.0.1:8181 check

backend letsencrypt-backend
   server letsencrypt 127.0.0.1:54321

##end haproxy file
sudo service haproxy restart
sudo nano /etc/apache2/ports.conf #set to 8181
sudo nano /etc/apache2/sites-available/wedobusinessbetter.com.conf
#set to 127.0.0.1:8181
sudo service apache2 restart

#set-up auto-renew
cd /opt/letsencrypt
#the following requires domains to be updated. multiple domains with new "-d domain.com" in series
./letsencrypt-auto certonly --agree-tos --renew-by-default --standalone-supported-challenges http-01 --http-01-port 54321 -d wedobusinessbetter.com 
#choose standalone
DOMAIN='wedobusinessbetter.com' sudo -E bash -c 'cat /etc/letsencrypt/live/$DOMAIN/fullchain.pem /etc/letsencrypt/live/$DOMAIN/privkey.pem > /etc/haproxy/certs/$DOMAIN.pem'

sudo service haproxy reload
sudo cp /opt/letsencrypt/examples/cli.ini /usr/local/etc/le-renew-haproxy.ini
sudo nano /usr/local/etc/le-renew-haproxy.ini
#update email, domain names, and standalone-supported-challenges = http-01
cd /opt/letsencrypt
./letsencrypt-auto certonly --renew-by-default --config /usr/local/etc/le-renew-haproxy.ini --http-01-port 54321
#auto-renew script
sudo nano /usr/local/sbin/le-renew-haproxy
#paste the following:
#!/bin/bash

web_service='haproxy'
config_file='/usr/local/etc/le-renew-haproxy.ini'
domain=`grep "^\s*domains" $config_file | sed "s/^\s*domains\s*=\s*//" | sed 's/(\s*)\|,.*$//'`
http_01_port='54321'
combined_file="/etc/haproxy/certs/${domain}.pem"

le_path='/opt/letsencrypt'
exp_limit=30;

if [ ! -f $config_file ]; then
        echo "[ERROR] config file does not exist: $config_file"
        exit 1;
fi

cert_file="/etc/letsencrypt/live/$domain/fullchain.pem"
key_file="/etc/letsencrypt/live/$domain/privkey.pem"

if [ ! -f $cert_file ]; then
  echo "[ERROR] certificate file not found for domain $domain."
fi

exp=$(date -d "`openssl x509 -in $cert_file -text -noout|grep "Not After"|cut -c 25-`" +%s)
datenow=$(date -d "now" +%s)
days_exp=$(echo \( $exp - $datenow \) / 86400 |bc)

echo "Checking expiration date for $domain..."

if [ "$days_exp" -gt "$exp_limit" ] ; then
  echo "The certificate is up to date, no need for renewal ($days_exp days left)."
  exit 0;
else
  echo "The certificate for $domain is about to expire soon. Starting Let's Encrypt (HAProxy:$http_01_port) renewal script..."
  $le_path/letsencrypt-auto certonly --agree-tos --renew-by-default --config $config_file --http-01-port $http_01_port

  echo "Creating $combined_file with latest certs..."
  sudo bash -c "cat /etc/letsencrypt/live/$domain/fullchain.pem /etc/letsencrypt/live/$domain/privkey.pem > $combined_file"

  echo "Reloading $web_service"
  /usr/sbin/service $web_service reload
  echo "Renewal process finished for domain $domain"
  exit 0;
fi
#end of script
sudo chmod +x /usr/local/sbin/le-renew-haproxy
#setup cron job
sudo crontab -e
30 2 * * 1 /usr/local/sbin/le-renew-haproxy >> /var/log/le-renewal.log



sudo apt-get install mongodb
sudo adduser meteor
sudo touch /etc/sudoers.d/directory
sudo echo "meteor ALL = (root) NOPASSWD: /sbin/start directory, /sbin/stop directory, /sbin/restart directory" > /etc/sudoers.d/directory
sudo echo 'MONGO_URL="mongodb://localhost:27017"' >> /etc/environment
sudo nano /etc/init/directory
#Begin upstart script

#!upstart
description "Directory Upstart"
author "jer"

env APP_NAME='directory'
env PORT='2016'
env ROOT_URL='https://wedobusinessbetter.com'
env NODE_BIN='/home/meteor/.nvm/v0.8.24/bin/node'

env SCRIPT_FILE="bundle/main.js" # Entry point for the nodejs app
env RUN_AS="meteor"

start on (local-filesystems and net-device-up IFACE=eth0)
stop on shutdown

script
export LOG_FILE="/home/meteor/$APP_NAME/log/upstart.log"
touch $LOG_FILE
chown $RUN_AS:$RUN_AS $LOG_FILE
chdir /home/meteor/$APP_NAME/builds/current
exec sudo -u $RUN_AS sh -c " PORT=$PORT ROOT_URL='$ROOT_URL' $NODE_BIN $SCRIPT_FILE >> $LOG_FILE$"
end script

respawn
respawn limit 5 60

###End script

su meteor
git clone https://github.com/creationix/nvm.git ~/.nvm
sed -i -e '1i [[ -s $HOME/.nvm/nvm.sh ]] && . $HOME/.nvm/nvm.sh' ~/.bashrc
source ~/.bashrc
nvm install 6.2.2 && nvm alias default 6.2.2
curl https://install.meteor.com | sh
sed -i -e '1i PATH="$PATH:/home/meteor/.meteor"' ~/.bashrc
source ~/.bashrc
cd ~ && pwd
mkdir directory && cd directory && pwd
mkdir builds log source working && ls
cd source
git init
git remote add origin https://github.com/jeremyevans6/BetterBusinessDirectory
git pull origin master













####  Webmin and Virtualmin installation  ####
cd ~
## this is the most recent ##
wget http://www.webmin.com/download/deb/webmin-current.deb #doesn't work
## or this is stable ##
wget http://prdownloads.sourceforge.net/webadmin/webmin_1.740_all.deb

### dependencies ###
sudo apt-get install libnet-ssleay-perl libauthen-pam-perl libio-pty-perl apt-show-versions libapt-pkg-perl

sudo dpkg --install webmin-current.deb
### or ###
sudo dpkg --install webmin_1.740_all.deb




####################
###### PHP #########
####################

sudo apt-get install mysql-server mysql-client
sudo mysql_install_db
sudo mysql_secure_installation
sudo apt-get install php5 php5-mysql libapache2-mod-auth-mysql libapache2-mod-php5 php5-mcrypt


sudo nano /etc/apache2/mods-enabled/dir.conf
    $$$ add index.php first $$$ 

sudo service apache2 restart


sudo nano /var/www/info.php
<?php
phpinfo();
?>

sudo apt-get install php5-mysql php5-curl php5-gd php5-intl php-pear php5-imagick php5-imap php5-mcrypt php5-memcache php5-ming php5-ps php5-pspell php5-recode php5-snmp php5-sqlite php5-tidy php5-xmlrpc php5-xsl php5-xcache
sudo service apache2 restart

### install PHPmyAdmin ###
sudo apt-get update
sudo apt-get install phpmyadmin
###$$$ REJECT db_common!!! $$$###
sudo php5enmod mcrypt
sudo service apache2 restart
###http://betterbetterbetter.us/phpmyadmin


### Apache2 config ###
sudo nano /etc/apache2/ports.conf
# $$$ Listen 8080 for NGINX or Varnish


#######
###         Varnish
### See: Everyone.works.with.jeremydavidevans.com/blog

su
apt-get install apt-transport-https
curl https://repo.varnish-cache.org/GPG-key.txt | apt-key add -
echo "deb https://repo.varnish-cache.org/ubuntu/ trusty varnish-4.1" >> /etc/apt/sources.list.d/varnish-cache.list
apt-get update
apt-get install varnish
sudo nano /etc/default/varnish
#edit the default configuration to listen on port 80 as follows
 DAEMON_OPTS="-a :80 \
             -T localhost:6082 \
             -f /etc/varnish/default.vcl \
             -S /etc/varnish/secret \
             -s malloc,256m"
sudo nano /etc/apache2/ports.conf
#change the "Listen" line to the following:
#          Listen 127.0.0.1:8080
#let's snoop around our virtualhost directory a bit...
ls /etc/apache2/sites-available/

#you should see all of your site directories here. You will need to edit them all like I will suggest you edit the default:
sudo nano /etc/apache2/sites-available/000-default.conf
#<VirtualHost 127.0.0.1:8080>
#...blah, blah, w/e
#</VirtualHost>
sudo service apache2 restart
sudo service varnish restart

sudo cp /lib/systemd/system/varnish.service /etc/systemd/system/
sudo nano /etc/systemd/system/varnish.service

# change "ExecStart=/usr/sbin/varnishd -a" from ":6081" to :80" . 
# Now we'll restart Vanrish using our fancy new systemd init file:

sudo service varnish restart
# or use this command, which actually reloads the /etc/default/varnish config file! 
# (Don't worry, we needed to update the systemd init script if you were having this problem since server reboots will cause it to return without the aforementioned step.)
systemctl reload varnish.service








##### Google PageSpeed ####
mkdir temp
cd temp
wget https://dl-ssl.google.com/dl/linux/direct/mod-pagespeed-stable_current_amd64.deb 
sudo dpkg -i mod-pagespeed-*.deb
sudo service apache2 restart
sudo apt-get -f install
sudo nano /etc/apache2/mods-available/pagespeed.conf
### set PageSpeed unplugged for development











##########################            APACHE2
#################################
###########     For multiple sites, use this set up


#Between Visits
sudo cp /etc/apache2/sites-available/000-default.conf /etc/apache2/sites-available/betweenvisits.org.conf
sudo nano /etc/apache2/sites-available/betweenvisits.org.conf
sudo a2ensite betweenvisits.org.conf
sudo service apache2 reload
sudo service apache2 restart


#Crystal Dragon Boulder
sudo cp /etc/apache2/sites-available/000-default.conf /etc/apache2/sites-available/crystaldragonboulder.com.conf
sudo nano /etc/apache2/sites-available/crystaldragonboulder.com.conf
sudo a2ensite crystaldragonboulder.com.conf
sudo service apache2 reload
sudo service apache2 restart


#Bovine Joe
sudo cp /etc/apache2/sites-available/crystaldragonboulder.com.conf /etc/apache2/sites-available/bovinejoe.com.conf
sudo nano /etc/apache2/sites-available/bovinejoe.com.conf
sudo a2ensite bovinejoe.com.conf
sudo service apache2 reload
sudo service apache2 restart

#artistas.xyz
sudo cp /etc/apache2/sites-available/crystaldragonboulder.com.conf /etc/apache2/sites-available/artistas.xyz.conf
sudo nano /etc/apache2/sites-available/artistas.xyz.conf
sudo a2ensite artistas.xyz.conf
sudo service apache2 reload
sudo service apache2 restart









sudo mkdir -p /var/www/betweenvisits.org/public_html
sudo mkdir -p /var/www/kulturedkitsch.info/public_html
sudo mkdir -p /var/www/crystaldragonboulder.com/public_html
sudo mkdir -p /var/www/bovinejoe.com/public_html

sudo chmod -R 755 /var/www


#begin editing
sudo nano /etc/apache2/sites-available/kulturedkitsch.info.conf


#end editing
sudo a2ensite betweenvisits.org.conf
sudo a2ensite kulturedkitsch.info.conf


cd /var/www/
sudo chown -R www-data:www-data .

sudo service apache2 reload
sudo service apache2 restart



#~~~@~~~!###############!~~~@~~~#
#~~~~!~~@## Wordpress ##@~~!~~~~#
#~~~@~~~!###############!~~~@~~~#
cd ~  
mkdir wp  
cd ~/wp
wget http://wordpress.org/latest.tar.gz
tar -xzvf latest.tar.gz 

mysql -u root -p
CREATE DATABASE b3me;
CREATE USER b3wp@localhost;
SET PASSWORD FOR b3wp@localhost= PASSWORD("qazsxdr");
GRANT ALL PRIVILEGES ON b3me.* TO b3wp@localhost IDENTIFIED BY 'qazsxdr';
FLUSH PRIVILEGES;
EXIT

###### For CrystalDragonBoulder.com
mysql -u root -p
CREATE DATABASE dragon;
CREATE USER dragon@localhost;
SET PASSWORD FOR dragon@localhost= PASSWORD("Qazsxdrewazxc1");
GRANT ALL PRIVILEGES ON dragon.* TO dragon@localhost IDENTIFIED BY 'Qazsxdrewazxc1';
FLUSH PRIVILEGES;
EXIT

sudo cp -R ~/wp/wordpress/* /var/www/crystaldragonboulder.com/public_html
sudo chown -R www-data:www-data /var/www/crystaldragonboulder.com/public_html


###### For BovineJoe.com
mysql -u root -p
CREATE DATABASE bovine;
CREATE USER bovine@localhost;
SET PASSWORD FOR bovine@localhost= PASSWORD("Qazsxdrewazx1");
GRANT ALL PRIVILEGES ON bovine.* TO bovine@localhost IDENTIFIED BY 'Qazsxdrewazx1';
FLUSH PRIVILEGES;
EXIT

sudo cp -R ~/wp/wordpress/* /var/www/bovinejoe.com/public_html
sudo chown -R www-data:www-data /var/www/bovinejoe.com




cd /var/www/
sudo chown -R www-data:www-data .



# SSL
# 1) Get SSL encryption
sudo mkdir -p /ssl/kulturedkitsch.info
#load .crt's into folder
# If sFTP is higher than root directory, then ...
# sudo mv /var/www/*.crt /ssl/kulturedkitsch.info
cd /ssl/kulturedkitsch.info
sudo cat /ssl/kulturedkitsch.info/* >> bundle.crt
sudo a2enmod proxy_http
sudo a2enmod headers 
sudo a2enmod ssl

# with pound for ssl termination, load balancing



###############
###############
###############
####Abante#####
#######Cart####
###############
###############
###############







###############
###### Mibew
###############

cd ~
mkdir tmp && cd tmp
sudo mkdir /var/www/kulturedkitsch.info/public_html/mibew/
  wget https://github.com/Mibew/mibew/archive/master.tar.gz
  tar xzf master.tar.gz
  sudo cp -R ~/tmp/mibew-master/src/mibew/ /var/www/kulturedkitsch.info/public_html/mibew/
#OR
  git clone https://github.com/Mibew/mibew.git
    sudo cp -R mibew/src/ /var/www/kulturedkitsch.info/public_html/mibew/
cd /var/www/kulturedkitsch.info/public_html/mibew/
sudo chmod -R 0755 .
sudo chown -R jer:jer .
npm install
gulp build
#releases holds a finished zip/tarball
# move the tarball to the mibew folder of web server 
cd /var/www/kulturedkitsch.info/mibew
sudo chown -R www-data:www-data .
#Create SQL User and Table
sudo cp configs/default_cols /caw/www
fig.yml configs/config.yml
sudo nano configs/config.yml
#Enter in Database credentials
sudo chown -R www-data:www-data .
# http://<yourdomain>/mibew/install
sudo rm /var/www/kulturedkitsch.info/public_html/mibew/install.php
#find url needed for cron task and then...
crontab -e
# Add: (with your own link)
#    0 * * * * wget -O - -q -t 1 http://kulturedkitsch.info/mibew/cron?cron_key=b2d45ebd01f21a6eaa2355a112f3242f
sudo chmod 0700 /mibew/files/avatar && sudo chmod 0700 /mibew/cache



##### Google PageSpeed ####
mkdir temp
cd temp
wget https://dl-ssl.google.com/dl/linux/direct/mod-pagespeed-stable_current_amd64.deb 
sudo dpkg -i mod-pagespeed-*.deb
sudo service apache2 restart
sudo apt-get -f install
sudo nano /etc/apache2/mods-available/pagespeed.conf
### set PageSpeed unplugged for development

#~~~@~~~!###############!~~~@~~~#
#~~~~!~~@## Wordpress ##@~~!~~~~#
#~~~@~~~!###############!~~~@~~~#

cd ~
wget http://wordpress.org/latest.tar.gz
tar -xzvf latest.tar.gz 

mysql -u root -p
CREATE DATABASE b3me;
CREATE USER b3wp@localhost;
SET PASSWORD FOR b3wp@localhost= PASSWORD("qazsxdr");
GRANT ALL PRIVILEGES ON b3me.* TO b3wp@localhost IDENTIFIED BY 'qazsxdr';
FLUSH PRIVILEGES;
EXIT

sudo mv ~/wordpress/* /var/www/betterbetterbetter.me/public_html

##### CAREFUL!!! ####// sudo a2enmod rewrite
cd /var/www
sudo chown -R www-data:www-data .

### Visit http://betterbetterbetter.me/wp-admin/install.php
#myadmin ###
# DB_NAME    b3me
# DB_USER    b3wp

# maybe need to make wp-config.php mannually:
sudo nano /var/www/html/wp-config.php
# copy and paste the contents of page to file


sudo chmod -R 755 /var/www
sudo chown -R $USER:$USER /var/www/artistas.xyz/public_html
sudo chown -R $USER:$USER /var/www/betterbetterbetter.me/public_html



  git config --global user.email "jeremyevans6@gmail.com"
  git config --global user.name "Jeremy Evans"
  git config --global credential.helper cache
  git config --global credential.helper 'cache --timeout=3600'






############################
####NODE.JS Install#########
############################
cd ~
sudo mkdir ~/node
cd ~/node

 %%%%%%%%%%% N %%%%%%%%%%%%%%%
 curl -L http://git.io/n-install | bash

source ~/.bashrc
 
 


source ~/.profile
sudo chown -R jer ~/
npm config set prefix '~/node/npm-global'


