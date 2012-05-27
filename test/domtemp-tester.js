$(function(){

var _img_src = 'http://bing.com/s/wlflag.ico';

module('common');
test('create-simple', function(){
    var $node = $('.simple > div');
    var temp = new dt($node[0]).fill({'class': 'red', 'name': 'bufeng', width: 30, height: 40});
    ok( $node.is('.red_title') );
    sameIgnoreCase( $.trim($node.html()), '<p>bufeng bufeng</p>' );
    deepEqual( $node.attr('jid'), 'red0red30' );
    deepEqual( $node.attr('style'), 'width: 30px; height: 40px' );
});

test('create-jquery', function(){
    var $node = $('.jquery > div');
    var temp = new dt($node[0]);
    temp.fill( {'name': 'bufeng', 'img': $('<img>', {src: _img_src}), friends: $('<span>', {text: 'ivy'})} );
    deepEqual( $node.find('img').attr('src'), _img_src );
    deepEqual( $node.find('span').html(), 'ivy' );
});

test('create-subattr', function(){
    var $node = $('.subattr > div');
    var temp = new dt($node[0]);
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
    var temp = new dt($node[0]);
    var data = {
        bg: _img_src,
        img: _img_src
    };
    temp.fill( data );
    deepEqual( $node.attr('style'), 'background: url(' + _img_src + ') no-repeat');
    deepEqual( $node.find('img').attr('src'), _img_src );
});

test('create-opt', function(){
    var $node = $('.opt > div');
    var temp = new dt($node[0]);
    
    var genders = { 'm': 'Male', 'f': 'Female' };
    var user = { 'lastName': 'bu', 'firstName': 'feng', 'gender': 'm', 'age': 26 };
    
    var temp = new dt($node[0], {
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
    var temp = new dt($node[0]);
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


function sameIgnoreCase( str1, str2 ){
    return deepEqual( str1.toLowerCase(), str2.toLowerCase() );
}

});
