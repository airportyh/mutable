module.exports = mutable
function mutable(fun){
  return function(){
    var before = snapshot(this)
    this.__mutable__ = true
    fun.apply(this, arguments)
    this.__mutable__ = false
    var after = snapshot(this)
    var diff = difference(before, after)
    if (diff){
      var emit = this.emit || this.trigger // EventEmitter API or jQuery/Backbone API
      if (emit){
        emit.call(this, 'change', {difference: diff})
      }else{
        console.error('Object', this, ' needs to have the EventEmitter .on() API or the Backbone .trigger() API.')
      }
    }
  }
}

mutable.lock = lock
function lock(obj){
  if (!Object.defineProperty) return
  obj.__mutable__ = false
  for (var key in obj){
    if (key.charAt(0) === '_') continue
    if (typeof obj[key] === 'function') continue
    lockProperty(obj, key)
  }
}

function lockProperty(obj, key){
  var value = obj[key]
  Object.defineProperty(obj, key, {
    get: function(){ return value },
    set: function(newvalue){

      if (obj.__mutable__){
        value = newvalue
      }else{
        throw new Error("Tried to mutable object's " + key + " in a non-mutable state.")
      }
    }
  })

}

function snapshot(obj){
  var ss = {}
  for (var key in obj){
    if (typeof obj[key] !== 'function'){
      ss[key] = obj[key]
    }
  }
  return ss
}

function difference(one, other){
  var diff = {}
  var numDiffs = 0
  for (var key in one){
    if (one[key] !== other[key]){
      diff[key] = [one[key], other[key]]
      numDiffs++
    }
  }
  for (var key in other){
    if (key in diff) continue
    if (one[key] !== other[key]){
      diff[key] = [one[key], other[key]]
      numDiffs++
    }   
  }
  return numDiffs > 0 ? diff : null
}