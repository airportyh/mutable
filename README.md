Mutable
=======

Here's a code example:

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