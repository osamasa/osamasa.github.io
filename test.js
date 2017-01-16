$(function(){
    var Settei = Backbone.Model.extend({
	defaults: function() {
	    return {
		id : 0,
		men : 1,
		ninzu : 4,
		doubles : 1,
		to : 0,
		limit : 5
	    };
	}
    });

    var Member = Backbone.Model.extend({
	defaults: function() {
	    return {
		id: 0,
		member_name: '名無し',
		winnum:0,
		losenum:0,
		drawnum:0
	    };
	}
    });

    var MemberList = Backbone.Collection.extend({

	comparator: 'id',

	// Reference to this collection's model.
	model: Member,

	// Save all of the todo items under the `"todos-backbone"` namespace.
	nextOrder: function() {
	    if (!this.length) return 1;
	    return this.last().get('id') + 1;
	}
    });    
    
    
    var  Game = Backbone.Model.extend({

	defaults: function() { 
	    return {
		id: 0,
		leftone: 0,
		lefttwo: 0,
		rightone: 0,
		righttwo: 0,
		hantei: 0,
		score_l: 0,
		score_r: 0,
		shiai_num: 0
	    };
	},
	// Toggle the `done` state of this todo item.
	toggle: function() {
	    this.save(null,{success: function success(model, res, options) {
	    }});
	}
    });
    
    // Todo Collection
    // ---------------

    // The collection of todos is backed by *localStorage* instead of a remote
    // server.

    var ChangeMemberView = Backbone.View.extend({
	gmodel: null,
	moto: "",
	
	template: _.template($('#kmembers-template').html()),

	initialize: function() {
	    this.listenTo(this.model, 'change', this.render);
	},
	events: {
	    "dblclick" : "chageMember",
	},
	setGmodel: function(_gmodel) {
	    this.gmodel = _gmodel;
	},
	getGmodel: function() {
	    return this.gmodel;
	},
	setMoto: function(_moto) {
	    this.moto = _moto;
	},
	getMoto: function() {
	    return this.moto;
	},
	chageMember: function() {
	    var kmem=$('input[name=kmembers_n]:checked').val();
	    var gmodel_c = _.clone();
	    this.getGmodel().set(this.getMoto(), kmem);
	    $.mobile.changePage("#s2"); 
	},
	// Re-render the titles of the todo item.
	// Modelの内容をHTMLに落としこむ関数
	render: function() {
	    var iShiainum = this.model.get('winnum') + this.model.get('losenum') + this.model.get('drawnum');
	    this.model.set({shiainum: iShiainum});
	    this.$el.html(this.template(this.model.toJSON()));
	    this.stickit();
	    
	    return this;
	},
    });

    var ChangeMembersView = Backbone.View.extend({
	gmodel: null,
	moto: "",

	initialize: function(){
	    　　　　//this.collectionはインスタンス生成時のCollectionです。
            this.collection.on('add', this.addNew, this);

	},
		setGmodel: function(_gmodel) {
	    this.gmodel = _gmodel;
	},
	getGmodel: function() {
	    return this.gmodel;
	},
	setMoto: function(_moto) {
	    this.moto = _moto;
	},
	getMoto: function() {
	    return this.moto;
	},

	addNew: function(member){
            var cview = new ChangeMemberView({model: member});
	    cview.setGmodel(this.getGmodel());
	    cview.setMoto(this.getMoto());
            this.$el.append(cview.render().el);
	},
	render: function(){
            this.collection.each(function(member){
		this.addNew(member);
            },this);
            return this;
	}
    });
    
    // Create our global collection of **Games**.
    var Game = new Game({"id":1, "leftone":1, "lefttwo":2, "rightone":3, "righttwo":4});
    var Members = new MemberList();
    for(var i=0;i<5;i++) {
	var m = new Member({"id":i+1});
	Members.add(m);
    }
    var dview = new ChangeMembersView({collection:Members});
    dview.setGmodel(Game);
    dview.setMoto("leftone");
    $('#kmembers').html(dview.render().el).trigger("create");    
    // $('#kmembers').html(dview.render().el);
});
