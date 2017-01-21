'use strict';

var winston = module.parent.require('winston'),
	Meta = module.parent.require('./meta'),
	Sendcloud = require('sendcloud'),
	Emailer = {};

var settings = {};

Emailer.init = function(data, callback) {
	function renderAdminPage(req, res) {
		res.render('admin/emailers/local', {});
	}

	data.router.get('/admin/emailers/SendCloud', data.middleware.admin.buildHeader, renderAdminPage);
	data.router.get('/api/admin/emailers/SendCloud', renderAdminPage);

	Meta.settings.get('emailer-local', function(err, _settings) {
		if (err) {
			return winston.error(err);
		}
		settings = _settings;
	});

	callback();
};

Emailer.send = function(data, callback) {

	var parameters = {
		apiKey: settings['emailer:local:apikey'],
		apiUser: settings['emailer:local:apiuser']
	};


	// console.log(parameters);

	var mailOptions = {
		from: data.from,
		to: data.to,
		html: data.html,
		text: data.plaintext,
		subject: data.subject
	};

	var sc = new Sendcloud(parameters.apiUser,parameters.apiKey,mailOptions.from,mailOptions.subject);

	sc.send(mailOptions.to,mailOptions.subject,mailOptions.html).then(function(info){
		var err;
		if(info.message ==='error'){
			winston.warn('[emailer.Sendcloud] Unable to send `' + data.template + '` email to uid ' + data.uid + '!');
			err = new Error(info.errors[0]);
		}else{
			winston.info('[emailer.Sendcloud] Sent `' + data.template + '` email to uid ' + data.uid +" success");
		}

		callback(err, data);
	});


};

Emailer.admin = {
	menu: function(custom_header, callback) {
		custom_header.plugins.push({
			"route": '/emailers/Sendcloud',
			"icon": 'fa-envelope-o',
			"name": 'Emailer Sendcloud'
		});

		callback(null, custom_header);
	}
};

module.exports = Emailer;
