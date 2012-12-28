
(function(){

module('common');
test('create & fill & append & clean', function(){
  var node = document.querySelector('.simple > div');
  var temp = dt(node).fill({'class': 'red', 'name': 'bufeng', width: 30, height: 40});

  equal(node.className,             'red_title',                  'class ------------ fill');
  equal(node.getAttribute('jid'),   'red0red30',                  'jid' );
  equal(node.getAttribute('style'), 'width: 30px; height: 40px;', 'style');
  equal(node.children[0].innerHTML, 'bufeng bufeng',              'innerHTML');

  temp.append( {'class': 'blue', width: 50} );
  equal(node.className,             'blue_title',                 'class ------------ append');
  equal(node.getAttribute('jid'),   'blue0blue50',                'jid' );
  equal(node.getAttribute('style'), 'width: 50px; height: 40px;', 'style');
  equal(node.children[0].innerHTML, 'bufeng bufeng',              'innerHTML');

  temp.clean();

  equal(node.className,             '', 'class ------------ clean');
  equal(node.getAttribute('jid'),   '', 'jid' );
  equal(node.style.cssText,         '', 'style');
  equal(node.children[0].innerHTML, '', 'innerHTML');
});

test('create with jquery object', function(){
  var $node = $('.jquery > p');
  var temp = dt($node);
  temp.fill( {text: 'text'} );
  equal($node.html(), 'text');
});

test('fill & append subattr', function(){
  var node = document.querySelector('.subattr p');
  var temp = dt(node);
  var user = {
    'user': {
      'name': {
        'last': 'feng',
        'first': 'Bu'
      }
    }
  };
  temp.fill(user);
  equal(node.innerHTML, 'name: Bu feng');
  temp.append( {'user': {'name': {last: 'Feng'}}} );
  equal(node.innerHTML, 'name: Bu Feng');
});

test('create with options & simple convert', function(){
  var node = document.querySelector('.opt > div');
  var genders = {
    'M': 'Male',
    'F': 'Female'
  };
  var user = {
    'lastName': 'Bu',
    'firstName': 'Feng',
    'gender': 'M',
    'age': 26
  };
  
  var temp = dt(node, {
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
  equal(node.children[0].innerHTML, 'Name: BUFENG');
  equal(node.children[1].innerHTML, 'Gender: Male');
  equal(node.children[2].innerHTML, 'Age: 26');
});

test('fill a loop', function(){
  var loop = document.querySelector('.loop > div');
  var temp = dt(loop);
  var data = {
    users: [{
      name: 'Tom',
      favorites: ['1', '2']
    }, {
      name: 'Sam',
      favorites: ['3', '4']
    }, {
      name: 'Jim'
    }]
  };
  temp.fill( data );
  equal(loop.children.length,               3);
  equal(loop.querySelectorAll('li').length, 4);
  equal(loop.querySelectorAll('p').length,  1);
  if(typeof console !== 'undefined' && console.log){
    console.log(loop.innerHTML);
  }
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
  
  equal($node.find('input[name=name]').val()                   , 'sofosogo');
  equal($node.find('input[name=gender]')[0].checked            , true);
  equal($node.find('input[name=gender]')[1].checked            , false);
  equal($node.find('input[name=age]').val()                    , '24');
  equal($node.find('input[name="details.language"]')[0].checked, true);
  equal($node.find('input[name="details.language"]')[1].checked, true);
  equal($node.find('select[name="details.school"]').val()      , 'HFUT');
  equal($node.find('select[name="details.sports"]').val()[0]   , 'Basketball');
  equal($node.find('select[name="details.sports"]').val()[1]   , 'PingPong');
  equal($node.find('input[name=confirmed]')[0].checked         , true);
  
  var fetched = temp.fetch();
  if(typeof JSON !== 'undefined' && JSON.stringify){
    equal(JSON.stringify(data), JSON.stringify(fetched));
  }

});

})();