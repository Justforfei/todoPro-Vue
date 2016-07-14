var data = {
  name: 'My Tree',
  completed: false,
  data: "2016-04",
  priority: "H",
  children: [
    { 
        name: 'hello',
        completed: false,
        data: "2016-04",
        priority: "H",
    },
    { 
        name: 'wat',
        completed: false,
        data: "2016-04",
        priority: "H",
    },
    {
        name: 'child folder',
        completed: false,
        data: "2016-04",
        priority: "H",
      children: [
        {
            name: 'child folder',
            completed: false,
            data: "2016-04",
            priority: "H",
          children: [
            { 
                name: 'hello',
                completed: false,
                data: "2016-04",
                priority: "H",
             },
            { 
                name: 'wat',
                completed: false,
                data: "2016-04",
                priority: "H",
             }
          ]
        },
        { 
            name: 'hello',
            completed: false,
            data: "2016-04",
            priority: "H",
         },
        { 
            name: 'wat',
            completed: false,
            data: "2016-04",
            priority: "H",
         },
        {
            name: 'child folder',
            completed: false,
            data: "2016-04",
            priority: "H",
          children: [
            { 
                name: 'hello',
                completed: false,
                data: "2016-04",
                priority: "H",
             },
            { 
                name: 'wat2',
                completed: false,
                data: "2016-04",
                priority: "H",
             }
          ]
        }
      ]
    }
  ]
}

var itemDataDefault = {
    name: 'new stuff',
    completed: false,
    data: "2016-04",
    priority: "L",
    children: []
}

Vue.component('item',{
    template: '#item-template',
    replace: true,
    props: {
        model: Object,
        
    },
    data: function () {
        return {
            open: false,
            newTodo: '',
            editedTodo: null,
            _tempTodo: ''
        }
    },
    computed: {
        isFolder: function () {
            return this.model.children && this.model.children.length;
        },
        isRoot: function () {
            return this.$parent===this.$root;
        },
        isFirstChild: function () {
            return !this.$parent.$children.indexOf(this);
        },
        isSecLevel: function () {
            return this.$parent.$parent===this.$root;
        },
        isLastChild: function () {
            // return this.$parent===this.$root || this.$parent.$children.indexOf(this)===(this.$parent.$children.length-1); // 无效！why
            return this.$parent===this.$root || this.$parent.model.children.indexOf(this.model)===(this.$parent.model.children.length-1);
        },
        isClipboardEmpty: function () {
            return !this.$root.clipboard;
        }
    },
    methods: {
        toggle: function () {
            if(this.isFolder){
                this.open= !this.open;
            }
        },
        addChild: function (cur,data) {
            this.changeType(cur);
            var item = {},
                data = data || {};
            console.log(data)
            for(var key in itemDataDefault){
                item[key] = data[key] || itemDataDefault[key]
            }
            if(data.children) {
                data.children.forEach(function (child,idx) {
                    for(var key in itemDataDefault){
                        item.children[idx][key] = child[key];
                    }
                })
            }
            console.log(item)
            
            
            cur.children.push(item);
            console.log(cur.children)
            console.log(cur)
        },
        changeType: function (cur,data) {
            if(!this.isFolder){
                Vue.set(cur, 'children', []);
                this.open = true;
            }
        },
        remove: function (cur) {
            var slibing = this.$parent.model.children;
            slibing.$remove(cur)
        },
        upLevel: function (cur) {
            console.log(this);
            if(this.$parent!==this.$root && this.$parent.$parent!==this.$root){
                this.remove(cur)
                this.$parent.$parent.model.children.push(cur);
            }
        },
        downLevel: function (cur) {
            if(this.$parent!==this.$root){
                var slibing = this.$parent.$children,
                    idx = slibing.indexOf(this),
                    bro = slibing[idx-1];
                if(bro){
                    bro.isFolder || Vue.set(bro.model, 'children', []);
                    this.addChild(bro.model,cur)
                    this.remove(cur)
                }
            }
        },
        goUp: function () {
            this.insertChild(this,-1);
        },
        goDown: function () {
            this.insertChild(this,1);
        },
        insertChild: function (cur,posIdx) {
            var slibing = cur.$parent.model.children;
            var idx = slibing.indexOf(cur.model);
            if((posIdx > 0 && idx < slibing.length-1) || ((posIdx < 0 && idx > 0))){
                var temp = slibing[idx];
                slibing.$set(idx, slibing[idx+posIdx]);
                slibing.$set(idx+posIdx, temp);
            }
        },
        copy: function (cur) {
                // var item = {},
                //     that = this;
                // for(var key in itemDataDefault){
                //     console.log(key)
                //     if(Array.isArray(cur[key])){
                //         item[key] = [] 
                //     }
                //     else{
                //         item[key] = cur[key] 
                //     }
                // }
            
            
            // if(cur.children)  {
            //     item.children = []
            //     copyChildren(cur.children,item.children)
            // }
            // function copyChildren(items,data){
            //     items.forEach(function (child,idx) {
            //         data[idx] = {};
            //         for(var key in itemDataDefault){
            //             if(!Array.isArray(child[key])) {
            //                 data[idx][key] = child[key];
            //             }else{
            //                 // data[idx][key] = []
            //                 var children = child.children
            //                 if(children) {
            //                     data.children = [];
            //                     copyChildren(children,data.children)
            //                 }
            //             }
            //         }
            //     })
            //     console.log(data)
            // }
            
            tree.clipboard = cur;
        },
        paste: function (cur) {
            if(cur===tree.clipboard){
                console.log("请不要把数据粘贴到自己身上，你是来逗逼的么");
                return
            }
            this.changeType(cur);
            this.addChild(cur,tree.clipboard);
            this.completeTodo(cur,false)
            tree.clipboard = null;
        },
        cut: function (cur) {
            this.copy(cur);
            var slibing = this.$parent.model.children;
            slibing.$remove(cur)
        },
        insert: function (cur,data) {
            var slibing = this.$parent.model.children;
            var idx = slibing.indexOf(cur);
            var item = data || {name: 'new stuff'+idx};
            for(var i = slibing.length;i > idx;i--){
                console.log(i);
                slibing.$set(i, slibing[i-1]);
            }
            slibing.$set(idx, item);
        },
        append: function (cur,data) {
            var slibing = this.$parent.model.children;
            var idx = slibing.indexOf(cur);
            var item = data || {name: 'new stuff fuck'};
            for(var i=slibing.length;i > idx+1;i--){
                slibing.$set(i, slibing[i-1]);
            }
            slibing.$set(idx+1, item);
        },
        debug: function () {
            // console.log(this.$root.treeData)
        },
        
        startEdit: function (cur) {
            this.beforeEditCache = cur.name; 
            this.editedTodo = cur;
        },
        doneEdit: function (cur) {
            if(!cur.name.trim()){
                if(!this.isFolder){
                    this.remove(cur);
                }else{
                    cur.name = this.beforeEditCache;
                }
            }
            // Todo 聚焦到下一个input
            // this.focusNext();
        },
        cancelEdit: function (cur) {
            cur.title = this.beforeEditCache;
        },
        focusNext: function(){
            this.toggle();
            var nextInput = this.$el.nextElementSibling;
            if(nextInput && nextInput.querySelector('input')) nextInput.querySelector('input').focus();
        },
        completeTodo: function (cur,value) {
            var that = this;
            value = typeof value==="boolean" ? value : !that.model.completed;
            if(cur.children){
                cur.children.forEach(function (child) {
                    child.completed = value;
                    if(child.children){
                        that.completeTodo(child,value);
                    }
                })
            }
            
        }
    } 
})

var tree = new Vue({
    el: '#tree',
    data: {
        treeData: data,
        clipboard: null,
    }
})

Vue.config.devtools = true;

