**domtemp，一个简单的基于DOM的Javascript模板引擎，仅仅需要节点或者属性中引入{{}}或者${{}}，适合需要复用DOM节点的Web App网站。最大限度地减少绑定事件解除事件的次数。**  
# API：  
**dt(node, opt)**  
@param node: DOM节点，必选。  
@param opt: 对象，可选。比如```{ thisp: XXObj, enable: "enable-msg", once: true }``` 所有可选参数。  
&nbsp;&nbsp;&nbsp;&nbsp;可以给某些占位符指定固定的值或者特殊的处理函数，用法详见[Q && A](#q--a)部分。  
@return template，拥有某些特殊方法fill，append，clear，opt）的对象。  

**template.fill(data, append)**  
填充数据。  
@param data 对象，必填。如``` data = {"user": { "name": "bufeng" }}``` 将会使用"bufeng"代替占位符 {{user.name}}。  
@param 布尔，可选。如果为true，表示追加数据，否则首先清空然后填充数据。  
@return template，返回自身。 
  
**template.append(data)**  
追加数组。作用等同于```template.fill(data, true)```。  
  
**template.clear()**  
将所有占位符节点或属性去掉，文字清空。  
@return template，返回自身。  


# Q && A
1. Q：在创建模板的时候，怎样使用第二个参数（opt）？  
A： 如果占位符的值是固定的，在模板创建以后就不会再改变，并且在调用fill方法时，不需要再次填充该值。比如在国际化过程中，label值仅仅跟语言有关，此时可以使用```{genderLabel: "Gender"}```来设置此label值。  
如果填充的值需要经过某种处理才能适应当前页面，比如填充的数据中gender的值是"m"，"f"（此数据直接来自数据库），但是页面需要显示的是"Male"，"Femal"。此时设置opt对象

``` js
  {
    gender: function( gender, data ){
      return gender === "m" : "Male" : ( gender === "f" ? "Female" : "" );
    }
  }
```

2. Q：如何编写合适的html文本？  
A: **data-each**是为了显示一个数组数据，比如在玩家成就面板上显示所有的玩家所有的成就。  
拥有each属性的节点包含两个个子节点，第一个表示当数组的个数大于0时，用于显示数组数据的模板，第二个用于显示数组个数为0时的信息，可以省略，此时不显示任何信息：

``` html 
<ul each="achievement">
  <li>{{.}}</li>
  <li class="no-item">No Achievement.</li>
</ul>
```

以上是each的默认行为，可以在创建模板时使用opt指定特殊实现。如：
  
``` js
archievements: function( archs, data ){
  var fragment = document.createDocumentFragment();
  for( var i = 0; i < archs.length; i++ ){
    fragment.appendChild( $("<li>", {"text": archs[i], "class": i % 2 ? "odd" : "even" })[0] );
  }
  if( archs.length === 0 ) fragment.appendChild( $("<div>", {"text": "No Archievement."})[0] );
  return fragment;
}
```
