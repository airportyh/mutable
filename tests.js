var mutable = require('./index')
var EventEmitter = require('events').EventEmitter
var assert = require('chai').assert

describe('observe', function(){

  it('emits change if property', function(){
    var onChangeCalled = false
    var o = {
      name: 'bob'
    }
    mutable.lock(o)
    o.__proto__ = EventEmitter.prototype
    o.on('change', function(e){
      assert.deepEqual(e.difference, {name: ['bob', 'dan']})
      onChangeCalled = true
    })
    o.setName = mutable(function(name){
      this.name = name
    })
    o.setName('dan')
    assert(onChangeCalled, 'should have called onchange')
  })

  it('doesnt emit change if no change', function(){
    var onChangeCalled = false
    var o = {
      name: 'bob'
    }
    o.__proto__ = EventEmitter.prototype
    o.on('change', function(e){
      onChangeCalled = true
    })
    o.setName = mutable(function(name){
      this.name = name
    })
    assert(!onChangeCalled)
  })

  it('disallows setting properties outside of mutables', function(){
    var o = {
      name: 'bob'
    }
    mutable.lock(o)
    assert.throw(function(){
      o.name = 'dan'
    }, "Tried to mutable object's name in a non-mutable state.")
  })

  it('full example', function(){
    function User(name, password){
      this.name = name
      this.password = password
      mutable.lock(this)
    }
    User.prototype.__proto__ = EventEmitter.prototype
    User.prototype.changePassword = mutable(function(newPwd){
      this.password = newPwd
    })

    var user = new User('bob', '12345')

    assert.equal(user.name, 'bob')
    assert.equal(user.password, '12345')

    var changeCalled = false
    user.on('change', function(e){
      assert.deepEqual(e.difference, {password: ['12345', '35124']})
      changeCalled = true
    })

    assert.throw(function(){
      user.password = '35124'
    }, "Tried to mutable object's password in a non-mutable state.")

    user.changePassword('35124')

    assert.equal(user.password, '35124')
    assert(changeCalled, 'should have called onchange')

  })

})