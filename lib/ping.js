
var request = require('request'),
    statusCodes = require('http').STATUS_CODES,
    mailer = require('./mailer');


/*
    Ping Constructor
*/

function Ping (opts) {
    // hold website to be monitored
    this.website = '';
    
    // frequency of pings in minutes
    this.timeout = 15;
    
    // interval handler
    this.handle = null;
    
    
    // Start monitoring
    this.init(opts);
    
    return this;
}



Ping.prototype = {

    init: function (opts) {
        var self = this;
        
        self.website = opts.website;
        
        self.timeout = (opts.timeout * (60 * 1000));
        
        self.title = opts.title;
        
        self.lastlog = '';
        
        self.foundTitle = '';
        
        if (opts.hasOwnProperty('repeat') && !opts.repeat) { 
            self.ping();
        }
        else {
            self.start();  
        }
    },

    
    checkTitle: function(body) {
        if (null == this.title) return true;
        var m=body && body.match(/<title>(.*?)<\/title>/i); 
        return m && m.length && (this.foundTitle=m[1]) === this.title;
    },
    
    
    ping: function () {
        var self = this, currentTime = Date.now();
        
        function handleResponse (error, res, body) {
            // Website is up
            if (!error && res.statusCode === 200 && self.checkTitle(body)) {
                self.isOk();
            }
            
            // No error but website not ok
            else if (!error) {
                self.isNotOk(res.statusCode);   
            }
            
            // Ping error
            else {
                self.isNotOk();
            }
        }
        
        try {
                // send request
            request(self.website, handleResponse);
        }
        catch (err) {
            self.isNotOk();
        }
    },
    
    
    
    
    isOk: function () {
        this.log('UP', 'OK');
    },
 
 
 
 
    isNotOk: function (statusCode) {
        var time =  Date.now(), 
            self = this,
            time = self.getFormatedDate(time),
            msg = (statusCodes[statusCode + ''] || 'Null'),
            
            htmlMsg = '<p>Time: ' + time;
            htmlMsg +='</p><p>Website: ' + self.website;
            htmlMsg += '</p><p>Message: ' + msg + '</p>';
            if (self.foundTitle) htmlMsg  += "</p><p>Title: " + self.foundTitle + " != " + self.title;
        
        this.log('DOWN', msg);
        
        // Send admin and email
        mailer({
            from: 'Website Checker <greasemonkeycn@gmail.com>',
            to: 'josher19@gmail.com,greasemonkeycn@gmail.com',
            subject: self.website + ' is down',
            body: htmlMsg
        }, function (error, res, other) {
            if (error) {
                console.log(error);
            }
            else {
                console.log(res.message || res || 'Failed to send email', typeof res, typeof other);
            }   
        });
    },

    
    
    
    start: function () {
        var self = this, time = Date.now();
        
        console.log("\nTime: " + self.getFormatedDate(time) + "\nPinging: " + self.website + "\n==========================================================>> \n");
        
        // create an interval for pings
        self.handle = setInterval(function () {
            self.ping();
        }, self.timeout); 
    },

    
    
    
    stop: function () {
        clearInterval(this.handle);
        this.handle = null;        
    },
    
    
    showlog: function() {
        console.log(this.lastlog);
    },
    
    toString: function() { 
        return this.website + " ~ " + this.lastlog 
    },
    
    log: function (status, msg) {
        var self = this, 
            time = Date.now(), 
            output = '';
            
        time = self.getFormatedDate(time);
        
        output += "\nWebsite: " + self.website;
        output += "\nTime: " + time;
        output += "\nTitle: " + self.foundTitle;
        output += "\nStatus: " + status;
        output += "\nMessage:" + msg  + "\n";
        
        console.log(output);
        
        self.lastlog = [status, msg, self.title, self.foundTitle].join(" ~ ");
        
        self.showlog();
    },

    
    
    
    getFormatedDate: function (time) {
        var currentDate = new Date(time);
  
        currentDate = currentDate.toISOString();
        currentDate = currentDate.replace(/T/, ' ');
        currentDate = currentDate.replace(/\..+/, ''); 

        return currentDate;
    }     
};

module.exports = Ping;
