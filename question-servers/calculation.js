var ERR = require('async-stacktrace');
var path = require('path');
var _ = require('lodash');

var error = require('../lib/error');
var questionHelper = require('../lib/questionHelper.js');

module.exports = {

    render: function(renderSelection, variant, question, submission, submissions, course, locals, callback) {
        const htmls = {
            extraHeadersHtml: '<script type="text/javascript" src="/javascripts/require.js"></script>',
            questionHtml: '',
            submissionHtmls: _.map(submissions, () => ''),
            answerHtml: '',
        };
        callback(null, [], htmls);
    },

    generate: function(question, course, variant_seed, callback) {
        var questionDir = path.join(course.path, 'questions', question.directory);
        questionHelper.loadServer(question, course, function(err, server) {
            if (ERR(err, callback)) return;
            var options = question.options || {};
            try {
                var vid = variant_seed;
                var questionData = server.getData(vid, options, questionDir);
            } catch (err) {
                let data = {
                    variant_seed: variant_seed,
                    question: question,
                    course: course,
                };
                err.status = 500;
                return ERR(error.addData(err, data), callback);
            }
            let data = {
                params: questionData.params,
                true_answer: questionData.trueAnswer,
                options: questionData.options || question.options || {},
            };
            callback(null, [], data);
        });
    },

    prepare: function(question, course, variant, callback) {
        const data = {
            params: variant.params,
            true_answer: variant.true_answer,
            options: variant.options,
        };
        callback(null, [], data);
    },
    
    getFile: function(filename, variant, question, course, callback) {
        questionHelper.loadServer(question, course, function(err, server) {
            if (ERR(err, callback)) return;
            var fileData;
            try {
                var vid = variant.variant_seed;
                var params = variant.params;
                var trueAnswer = variant.true_answer;
                var options = variant.options;
                var questionDir = path.join(course.path, 'questions', question.directory);
                fileData = server.getFile(filename, vid, params, trueAnswer, options, questionDir);
            } catch (err) {
                var data = {
                    variant: variant,
                    question: question,
                    course: course,
                };
                err.status = 500;
                return ERR(error.addData(err, data), callback);
            }
            callback(null, fileData);
        });
    },

    parse: function(submission, variant, question, course, callback) {
        const data = {
            params: variant.params,
            true_answer: variant.true_answer,
            submitted_answer: submission.submitted_answer,
            parse_errors: {},
        };
        callback(null, [], data);
    },

    grade: function(submission, variant, question, course, callback) {
        questionHelper.loadServer(question, course, function(err, server) {
            if (ERR(err, callback)) return;
            var grading;
            try {
                var vid = variant.variant_seed;
                var params = variant.params;
                var trueAnswer = variant.true_answer;
                var submittedAnswer = submission.submitted_answer;
                var options = variant.options;
                var questionDir = path.join(course.path, 'questions', question.directory);
                grading = server.gradeAnswer(vid, params, trueAnswer, submittedAnswer, options, questionDir);
            } catch (err) {
                const data = {
                    submission: submission,
                    variant: variant,
                    question: question,
                    course: course,
                };
                err.status = 500;
                return ERR(error.addData(err, data), callback);
            }
            const data = {
                score: grading.score,
                feedback: grading.feedback,
                partial_scores: null,
                submitted_answer: submission.submitted_answer,
                parse_errors: submission.parse_errors,
            };
            callback(null, [], data);
        });
    },
};
