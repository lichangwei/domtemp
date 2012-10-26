$(function(){

var _img_src = 'http://bing.com/s/wlflag.ico';

module('common');
test('create-simple', function(){
    var $node = $('.simple > div');
    var temp = dt($node).clean().fill({'class': 'red', 'name': 'bufeng', width: 30, height: 40});
    ok( $node.is('.red_title') );
    sameIgnoreCase( $.trim($node.html()), '<p>bufeng bufeng</p>' );
    deepEqual( $node.attr('jid'), 'red0red30' );
    deepEqual( $node.attr('style'), 'width: 30px; height: 40px' + ($.browser.msie ? ';' : '' ));
});

test('create-jquery', function(){
    var $node = $('.jquery > div');
    var temp = dt($node).clean();
    temp.fill( {'name': 'bufeng', 'img': $('<img>', {src: _img_src}), friends: $('<span>', {text: 'ivy'})} );
    deepEqual( $node.find('img').attr('src'), _img_src );
    deepEqual( $node.find('span').html(), 'ivy' );
});

test('create-subattr', function(){
    var $node = $('.subattr > div');
    var temp = dt($node).clean();
    var user = {
        'name': {last: 'feng', first: 'bu'}, 
        'img': $('<img>', {src: _img_src}) 
    };
    temp.fill( {user: user} );
    deepEqual( $node.find('div').html(), 'name: bu feng' );
    deepEqual( $node.find('img').attr('src'), _img_src );
});

test('create-alias', function(){
    var $node = $('.alias > div');
    var temp = dt($node).clean();
    var data = {
        bg: _img_src,
        img: _img_src
    };
    temp.fill( data );
    if($.browser.msie){
        deepEqual( $node.attr('style'), 'background: url("' + _img_src + '") no-repeat;');
    }else{
        deepEqual( $node.attr('style'), 'background: url(' + _img_src + ') no-repeat');
    }
    deepEqual( $node.find('img').attr('src'), _img_src );
});

test('create-opt', function(){
    var $node = $('.opt > div');
    var temp = dt($node).clean();
    
    var genders = { 'm': 'Male', 'f': 'Female' };
    var user = { 'lastName': 'bu', 'firstName': 'feng', 'gender': 'm', 'age': 26 };
    
    var temp = dt($node[0], {
        'gender': function( val ){
            return genders[val] || 'Unknown';
        },
        'name': function( val, user ){
            return user.lastName + user.firstName;
        },
        'labelGender': 'Gender',
        'labelName': 'Name'
    });
    temp.fill( user );
    sameIgnoreCase($node.html().replace(/\s*/g, ''), '<div>Name:bufeng</div><div>Gender:Male</div><div>Age:26</div>' );
});

test('create-loop', function(){
    var $node = $('.loop > div');
    var temp = dt($node).clean();
    var data = {
        users: [{
            name: 'Tom',
            phone: ['1234', '5678']
        }, {
            name: 'Sam',
            phone: ['4321', '8765']
        }, {
            name: 'Jim'
        }]
    };
    temp.fill( data );
    deepEqual($node.children().length, 3);
    deepEqual($node.find('li').length, 4);
    deepEqual($node.find('p').length, 1);
});

test('form', function(){
    var $node = $('.form > form');
    var temp = dt($node).clean();
    var data = { 
        name: 'sofosogo',
        gender: 0,
        age: 24,
        desc: 'SE',
        details:{
            language: ['Chinese', 'English'],
            school: 'HFUT',
            sports: ['Basketball', 'PingPong']
        },
        confirmed: 1
    };
    temp.fill(data);
    
    deepEqual($node.find('input[name=name]').val(), 'sofosogo');
    deepEqual($node.find('input[name=gender]')[0].checked, true);
    deepEqual($node.find('input[name=gender]')[1].checked, false);
    deepEqual($node.find('input[name=age]').val(), '24');
    deepEqual($node.find('input[name="details.language"]')[0].checked, true);
    deepEqual($node.find('input[name="details.language"]')[1].checked, true);
    deepEqual($node.find('select[name="details.school"]').val(), 'HFUT');
    deepEqual($node.find('select[name="details.sports"]').val()[0], 'Basketball');
    deepEqual($node.find('select[name="details.sports"]').val()[1], 'PingPong');
    deepEqual($node.find('input[name=confirmed]')[0].checked, true);
    
    var fetched = temp.fetch();
    deepEqual(data.toString(), fetched.toString());
});


function sameIgnoreCase( str1, str2 ){
    return deepEqual( str1.toLowerCase(), str2.toLowerCase() );
}

});
