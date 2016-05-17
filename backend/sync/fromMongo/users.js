var _ = require('underscore');
var async = require('async');
var Promise = require('bluebird');

var models = require('../../models');
var config = require('../../config');
var db = require('../../db');

module.exports = {
    sync: function(courseInfo, uidToRole, callback) {
        db.uCollect.find({}, {uid: 1, name: 1}, function(err, cursor) {
            if (err) return callback(err);
            cursor.toArray(function(err, objs) {
                if (err) return callback(err);
                async.each(objs, function(u, callback) {
                    Promise.try(function() {
                        return models.User.upsert({
                            uid: u.uid,
                            name: u.name
                        });
                    }).then(function() {
                        return models.User.findOne({where: {
                            uid: u.uid
                        }});
                    }).then(function(user) {
                        if (!user) throw Error("no user where uid = " + u.uid);
                        var role = uidToRole(u.uid);
                        if (role != "Student") return Promise.resolve(null);
                        var sql
                            = ' INSERT INTO enrollments'
                            + ' (user_id, course_instance_id, role)'
                            + ' VALUES ($userId, $courseInstanceId, \'Student\')'
                            + ' ON CONFLICT (user_id, course_instance_id) DO NOTHING'
                            + ' ;';
                        var params = {
                            userId: user.id,
                            courseInstanceId: courseInfo.courseInstanceId,
                        };
                        return models.sequelize.query(sql, {bind: params});
                    }).then(function() {
                        callback(null);
                    }).catch(function(err) {
                        callback(err);
                    });
                }, function(err, objs) {
                    if (err) return callback(err);
                    callback(null);
                });
            });
        });
    },
};
