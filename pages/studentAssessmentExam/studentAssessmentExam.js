var ERR = require('async-stacktrace');
var async = require('async');
var express = require('express');
var router = express.Router();

var error = require('../../lib/error');
var questionServers = require('../../question-servers');
var sqldb = require('../../lib/sqldb');
var sqlLoader = require('../../lib/sql-loader');

var sql = sqlLoader.loadSqlEquiv(__filename);

function makeAssessmentInstance(req, res, callback) {
    sqldb.beginTransaction(function(err, client, done) {
        if (ERR(err, callback)) return;

        var assessment_instance_id, new_questions;
        async.series([
            function(callback) {
                var params = [
                    res.locals.assessment.id,
                    res.locals.user.user_id,
                    res.locals.authn_user.user_id,
                    res.locals.authz_data.mode,
                    res.locals.authz_result.time_limit_min,
                    res.locals.authz_data.date,
                ];
                sqldb.callWithClientOneRow(client, 'assessment_instances_insert', params, function(err, result) {
                    if (ERR(err, callback)) return;
                    assessment_instance_id = result.rows[0].assessment_instance_id;
                    callback(null);
                });
            },
            function(callback) {
                var params = [
                    res.locals.assessment.id,
                ];
                sqldb.callWithClient(client, 'select_assessment_questions', params, function(err, result) {
                    if (ERR(err, callback)) return;
                    new_questions = result.rows;
                    callback(null);
                });
            },
            function(callback) {
                async.each(new_questions, function(new_question, callback) {
                    var params = {
                        authn_user_id: res.locals.authn_user.user_id,
                        assessment_question_id: new_question.assessment_question_id,
                        assessment_instance_id: assessment_instance_id,
                    };
                    sqldb.queryWithClientOneRow(client, sql.make_instance_question, params, function(err, result) {
                        if (ERR(err, callback)) return;
                        // FIXME: returning with error here triggers "Can't set headers" exception
                        var instance_question_id = result.rows[0].id;

                        const require_available = false;
                        questionServers.ensureVariant(client, instance_question_id, res.locals.authn_user.user_id, new_question.question, res.locals.course, {}, require_available, function(err, _variant) {
                            if (ERR(err, callback)) return;
                            callback(null);
                        });
                    });
                }, function(err) {
                    if (ERR(err, callback)) return;
                    callback(null);
                });
            },
            function(callback) {
                var params = {assessment_instance_id: assessment_instance_id};
                sqldb.queryWithClient(client, sql.set_max_points, params, function(err, _result) {
                    if (ERR(err, callback)) return;
                    callback(null);
                });
            },
        ], function(err) {
            sqldb.endTransaction(client, done, err, function(err) {
                if (ERR(err, callback)) return;
                callback(null, assessment_instance_id);
            });
        });
    });
}

router.get('/', function(req, res, next) {
    if (res.locals.assessment.type !== 'Exam') return next();
    if (res.locals.assessment.multiple_instance) {
        res.render(__filename.replace(/\.js$/, '.ejs'), res.locals);
    } else {
        var params = {
            assessment_id: res.locals.assessment.id,
            user_id: res.locals.user.user_id,
        };
        sqldb.query(sql.select_single_assessment_instance, params, function(err, result) {
            if (ERR(err, next)) return;
            if (result.rowCount == 0) {
                res.render(__filename.replace(/\.js$/, '.ejs'), res.locals);
            } else {
                res.redirect(res.locals.urlPrefix + '/assessment_instance/' + result.rows[0].id);
            }
        });
    }
});

router.post('/', function(req, res, next) {
    if (res.locals.assessment.type !== 'Exam') return next();
    if (!res.locals.authz_result.authorized_edit) return next(error.make(403, 'Not authorized', res.locals));
    if (req.body.postAction == 'newInstance') {
        if (res.locals.authz_result.password != null) {
            if (req.body.password == null) return next(new Error('Password required for this assessment'));
            if (req.body.password !== res.locals.authz_result.password) {
                return next(new Error('Incorrect password'));
            }
        }
        makeAssessmentInstance(req, res, function(err, assessment_instance_id) {
            if (ERR(err, next)) return;
            res.redirect(res.locals.urlPrefix + '/assessment_instance/' + assessment_instance_id);
        });
    } else {
        return next(error.make(400, 'unknown postAction', {locals: res.locals, body: req.body}));
    }
});

module.exports = router;
