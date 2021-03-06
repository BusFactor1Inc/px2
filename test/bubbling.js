var expect = require('chai').expect,
    sinon = require('sinon');

module.exports = function (constructor) {
    describe('bubbling', function () {
        var obj, col, col2, cols, handler, event;
        beforeEach(function () {
            var clsa = constructor({
                type: 'obj',
                init: function () {
                    this.create('a', 0);
                }
            });
            var clsb = constructor({type: 'objs', contains: 'obj'});
            var clsc = constructor({type: 'objs', contains: 'obj'});
            var clsd = constructor({type: 'objss', contains: 'objs'});

            obj = new clsa();
            col = new clsb();
            col2 = new clsc();
            cols = new clsd();
            col.add(obj);
            col2.add(obj);
            cols.add(col);
            cols.add(col2);
            handler = sinon.spy(function (e) {
                expect(e).to.be.an.object;
                expect(e.target).to.eql(obj);
                expect(e.value).to.eql(obj.a()-1);
            });
        });
        it('should pass the object as the event target and the correct event value', function () {
            obj.on('change', handler);
            obj.a(obj.a()+1);
            expect(handler.calledOnce).to.be.true;
        });
        it('should pass the object as the event target up and the correct event value', function () {
            col.on('change', handler);
            obj.a(obj.a()+1);
            expect(handler.calledOnce).to.be.true;
        });
        it('should pass the object as the event target up multiple levels and the correct event value', function () {
            cols.on('change', handler);
            obj.a(obj.a()+1);
            expect(handler.calledTwice).to.be.true;
        });

        it('should not call the parent event handler when false is returned from the child event handler', function () {
            var cls = constructor({
                init: function () {
                    this.create('a', 0);
                }
            });
            var child = new cls();
            var parent = new cls({});
            parent.add(child);
            
            parentHandler = sinon.spy(function (e) { });
            childHandler = sinon.spy(function (e) { return false; });
            
            parent.on('change', parentHandler);
            child.on('change', childHandler);
            
            child.a(1);
            
            expect(parentHandler.called).to.be.false;
        });
        
        it('should call the parent event handler when true is returned from the child event handler', function () {
            var clsa = constructor({
                init: function () {
                    this.create('a', 0);
                }
            })
            var clsb = constructor({});
            var child = new clsa();
            var parent = new clsb();
            parent.add(child);
            
            parentHandler = sinon.spy(function (e) { });
            childHandler = sinon.spy(function (e) { return true; });
            
            parent.on('change', parentHandler);
            child.on('change', childHandler);
            
            child.a(1);
            
            expect(parentHandler.called).to.be.true;
        });

        it('should not call the parent event handler when a truthy value is returned from the child event handler', function () {
            var clsa = constructor({
                init: function () {
                    this.create('a', 0);
                }
            })
            var clsb = constructor({});
            var child = new clsa();
            var parent = new clsb();
           
            parent.add(child);
            
            parentHandler = sinon.spy(function (e) { });
            childHandler = sinon.spy(function (e) { return 1; });
            
            parent.on('change', parentHandler);
            child.on('change', childHandler);
            
            child.a(1);
            
            expect(parentHandler.called).to.be.false;
        });
    });
}
