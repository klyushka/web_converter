'use strict'

module.exports = function (models) {
    var CheckPoint = models.CheckPoint;
    var CheckPointGroup = models.CheckPointGroup;
    var TestAnswer = models.TestAnswer;
    var TestCase = models.TestCase;
    var TestCaseQuestion = models.TestCaseQuestion;

    TestAnswer.make = function (check_point_id, user_id) {

        //найти вариант для заданной контрольной работы, который использовался меньше всего раз
        //и выдать его пользователю
        var ctx = {};
        var options = {};
        options.check_point_id = check_point_id;

        return new Promise(function(resolve, reject) {

            return sequelize.transaction(function (t) {
                return app.TestCase.findAll({
                        where: options,
                        attributes: ['id', [sequelize.fn('COUNT', sequelize.col('tests_answers.id')), 'usage_amount']],
                        include: [{
                            model: app.TestAnswer,
                            as: 'tests_answers',
                            attributes: [],
                            duplicating: false
                        }],
                        raw: true,
                        group: ['test_case.id'],
                        transaction: t,
                        order: [sequelize.fn('min', 'usage_amount')]
                    }).then(function(result) {
                        console.log('result', result);
                        ctx.test_case_id = result[0].id;

                        //TODO создать TestAnswer и вернуть вопрос для выполнения
                        return app.TestAnswer.create(
                            {
                                user_id: user_id, 
                                check_point_id: check_point_id,
                                test_case_id: result[0].id,
                                start: new Date()
                            }, {
                                transaction: t
                            });
                    }).catch(function(err) {
                        console.log('make test answer method err', err);
                        throw err;
                    });
            }).then(function() {
                return app.TestAnswer.next_question(check_point_id, user_id);
            }).then(function(next_question) {

                resolve(next_question);
                //return ctx;
            }).catch(function(err) {
                console.log('make test answer method err', err);
                throw err;
            });
        });

    },

    TestAnswer.next_question = function(check_point_id, user_id) {

        var query = `
            select distinct x.*, d.title as db_title, d.description as db_description
            from databases as d, questions as x, test_cases as y, tests_answers as z, test_cases_questions as m
            where d.id = x.db_id and z.check_point_id = :check_point_id: and z.user_id = :user_id: and
                z.test_case_id = m.test_case_id and m.question_id = x.id and not exists 
                ( select * 
                  from questions_answers as n 
                  where n.question_id = x.id and n.check_point_id = :check_point_id: and
                    n.user_id = :user_id:
                );
            `;
        query = query.replace_all(':user_id:', user_id).replace_all(':check_point_id:', check_point_id);

        console.log('query', query);


        return sequelize.query(
            query,
            {
                type: sequelize.QueryTypes.SELECT,
                raw: true
            }
        ).catch(function(err) {
            console.log('next question method err', err);
            throw err;
        });
    }


};



String.prototype.replace_all = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};
