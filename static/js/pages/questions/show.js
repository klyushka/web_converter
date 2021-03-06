$(document).ready(function() {
    // TODO partner_id объявлен в шаблоне!

    var $editable = $('.editable');

    $editable.editable({
        ajaxOptions: { type:'PUT' },
        type: 'textarea',
        mode: 'inline',
        url: '/questions/' + question_id,
        pk: 1, //иначе не уходит ajax
        params: function(params) {
            var obj = {};

            if (params.value === '') {
                obj[params.name] = [''];
            } else {
                obj[params.name] = params.value;
            }

            return obj;
        },
        success: function(res) { window.location.reload(); },
        error: function(res) { console.log(res); },
        validate: function(value) {
            if($.trim(value) == '') return 'Необходимо заполнить данное поле';
        }
    });

    $editable.editable('toggleDisabled');
    //$balance.editable('toggleDisabled');

    $('#edit').click(function() {
        var $this = $(this);

        if ($this.attr('data-edit') === 'enable') {
            //off
            $this.removeClass('active');
            $this.attr('data-edit', 'disable');
        } else {
            //on
            $this.addClass('active');
            $this.attr('data-edit', 'enable');
        }

        $editable.editable('toggleDisabled');
        //$balance.editable('toggleDisabled');

    });


    $.get('/databases/schema/' + db_id, function(res) {
        $('#db_schema_div').html('<img src="/db_schema/' + res.file +
             '" style="max-height: 100%;max-width: 100%;" alt="">');
    }).fail(function(err) {
        bootbox.alert({
            message: 'err' + err.message,
            className: "slideInDown",
            buttons: {
                ok: {
                    label: "OK",
                    className: "btn-success"
                }
            }
        });
    });



    if (window.right_answer_data) {

       if (right_answer_data.length > 0) {
           var fields = [],
               query_data = right_answer_data;

           for (key in query_data[0]) {
               if (key.toLowerCase().indexOf('id') != -1 || key.toLowerCase().indexOf('ид') != -1)
                   fields.push({ name: key, type: "text", editing: false});
               else if (key.toLowerCase().indexOf('date') != -1 || key.toLowerCase().indexOf('дата') != -1)
                   fields.push({ name: key, type: "date"});
               else
                   fields.push({ name: key, type: "text"});
           }

           $('#sql_right_answer_data').jsGrid({
               width: "100%",
               sorting: true,
               paging: true,
               pageSize: 15,
               pageButtonCount: 5,
               pagerFormat: "Страницы: {pages}",
               data: query_data,
               fields: fields,
           });

       } else {
           $('#sql_right_answer_data').val('Запрос не дал результатов');
       }
    };


    $("#sql_right_answer_btn").click(function() {
        get_sql_res(db_id, $('[data-name="sql_answer"]').text(), '#sql_right_answer_data');
    });

});
