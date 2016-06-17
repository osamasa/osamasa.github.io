$(function(){
    var rireki = '2017061416';

    /** CSV を JSON形式に変換する **/
    function csv2json(data){
	var jsonArray = [];
	var csvArray = data.split('\r\n');
	
	for (var i = 0; i < csvArray.length - 1; i++) {
	    var a_line = new Array();
	    // カンマで区切られた各データに分割する
	    var csvArrayD = csvArray[i].split(',');
	    //// 各データをループ処理する
	    jsonArray.push(csvArrayD);
	}
	return jsonArray;
    }

    var rireki = Backbone.Model.extend({
	defaults: function() {
	    return {
		id : 0,
		date : null,
		note : null
	    };
	},
	makeRirekiStr: function () {
	    return this.date.getFullYear() + ("0" + (this.date.getMonth()+1)).substr(-2) + + ("0" + (this.date.getDate())).substr(-2) + ("0" + (this.date.getHours())).substr(-2);
	}
    });

    var RirekiList = Backbone.Collection.extend({
	
	comparator: 'id',
	model: rireki,
	localStorage: new Backbone.LocalStorage("ransulist")
	nextOrder: function() {
	    if (!this.length) return 1;
	    return this.first().get('id') + 1;
	},
	comparator : function(a, b) { 
	    return (b.get('date') > a.get('date') ? 1 : -1);
	}
    });

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

    var SetteiList = Backbone.Collection.extend({
	comparator: 'id',
	model: Settei,
	localStorage: new Backbone.LocalStorage("kransuhyoukun" + rireki)
    });

    var SetteiModel = new SetteiList();

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
	localStorage: new Backbone.LocalStorage("mransuhyoukun" + rireki),

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
		score_r: 0
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
    var GameList = Backbone.Collection.extend({

	comparator: 'id',

	// Reference to this collection's model.
	model: Game,

	// Save all of the todo items under the `"todos-backbone"` namespace.
	localStorage: new Backbone.LocalStorage("ransuhyoukun" + rireki),

	nextOrder: function() {
	    if (!this.length) return 1;
	    return this.last().get('id') + 1;
	},
	// CVS取得分だけ modelを追加する
	saveGame: function( mdata ) {
	    this.model
	}
    });    

    var SetteiGamenView = Backbone.View.extend({
	template: _.template($('#sdialog-template').html()),

	model: Settei,

	bindings: {
	    '#flip-min' : 'doubles',
	    '#select-choice-1' : 'ninzu',
	    '#select-choice-2' : 'men',
	},

	initialize: function() {
	},

	render: function() {
//	    this.model = SetteiModel.get(0);
	    this.$el.html(this.template(this.model.toJSON()));
	    this.stickit();
	    return this;
	},
    });


    var DialogView = Backbone.View.extend({
	template: _.template($('#dialog-template').html()),

	events: {
	    "click #dialogsettei":  "settei",
	},
	
	bindings: {
	    'input[name="hantei"]' : 'hantei',
	    '#select-choice-10' : 'score_l',
	    '#select-choice-11' : 'score_r'
	},
	
	initialize: function() {
	},

	settei: function() {
	    this.model.save();
	},

	setModel: function(model) {
	    this.model = model;
	},
	
	render: function() {
	    this.$el.html(this.template(this.model.toJSON()));
	    this.stickit();
	    return this;
	},
    });


    var Members = new MemberList();

    var MembersView = Backbone.View.extend({

	tagName:  "li",
	id: function(){ return _.uniqueId("member"); },

	template: _.template($('#mitem-template').html()),

//	bindings: {
//	    '.member_name' : 'member_name'
//	},

	// The TodoView listens for changes to its model, re-rendering. Since there's
	// a one-to-one correspondence between a **Todo** and a **TodoView** in this
	// app, we set a direct reference on the model for convenience.
	// Modelの更新を検知してViewを更新するために、ModelをlistenToしておく
	// よって、ModelのTodoとViewのTodoViewは1:1で紐づくことになる
	initialize: function() {
//	    this.listenTo(this.model, 'change', this.render);
//	    this.listenTo(this.model, 'destroy', this.remove);
	},


	// Re-render the titles of the todo item.
	// Modelの内容をHTMLに落としこむ関数
	render: function() {
	    this.$el.html(this.template(this.model.toJSON()));
//	    this.stickit();
	    return this;
	},

    });
    
    
    // Create our global collection of **Games**.
    var Games = new GameList();

    var GamesView = Backbone.View.extend({

	tagName:  "li",
	id: function(){ return _.uniqueId("fshiai"); },

	template: _.template($('#item-template').html()),

	writng_flg : false,

	events: {
	    "click .ph-tap"   : "colorChange",
	    "click .dialogopenbtn" : "dialogOpen"
	},

	// The TodoView listens for changes to its model, re-rendering. Since there's
	// a one-to-one correspondence between a **Todo** and a **TodoView** in this
	// app, we set a direct reference on the model for convenience.
	// Modelの更新を検知してViewを更新するために、ModelをlistenToしておく
	// よって、ModelのTodoとViewのTodoViewは1:1で紐づくことになる
	initialize: function() {
	    this.listenTo(this.model, 'change', this.render);
	    this.listenTo(this.model, 'destroy', this.remove);
	},

	bindings: {
	    '.score_l' : 'score_l',
	    '.score_r' : 'score_r',
	    '.hantei1' : 'hantei',
	    '.hantei2' : 'hantei'
	},

	// Re-render the titles of the todo item.
	// Modelの内容をHTMLに落としこむ関数
	render: function() {
	    this.$el.html(this.template(this.model.toJSON()));
	    this.stickit();
	    return this;
	},

	// Toggle the `"done"` state of the model.
	// Modelのdoneステータスをトグルする関数
	colorChange: function() {

	    var allclass = $("div.ph-tapped");
	    var scoreclass = $("div.ph-tapped.vscore");
	    var myclass = this.$("div.ph-tap");

	    allclass.toggleClass("ph-tapped ph-tap");
	    myclass.toggleClass("ph-tap ph-tapped");
	},
	
	dialogOpen: function() {
	    var dview = new DialogView;
	    dview.setModel(this.model);
	    $('#shouhai-contents').html(dview.render().el).trigger("create");
	},


	// Close the `"editing"` mode, saving changes to the todo.
	// 編集モードを終了する関数
	close: function(options) {
	    var maeclass = options["maeclass"];
	    maeclass.each(function() {

		var score_l=$(this).find("select.score_l").val();
		var score_r=$(this).find("select.score_r").val();
		var hantei1= $(this).find("select.hantei1").val();	      
		var hantei2= $(this).find("select.hantei2").val();	      

		if((hantei1 == 0) && (hantei2==0)) {
		    score_l=0;
		    score_r=0;
		}

		var model = Games.where({ "id" : options["id"] });
		model.save({ "hantei" : hantei1, "score_l" : score_l , "score_r" : score_r});
	    });

	},

	// Remove the item, destroy the model.
	// Modelの削除時に使う関数
	clear: function() {
	    this.model.destroy();
	}

    });


    var MailView = Backbone.View.extend({
//	id: "s4",
//	tagName: 'div',
//	attributes: {
//	    'data-dialog' : "true",
//	    'data-role' : "page"
//	},
	
	template: _.template($('#mailbun-template').html()),

	initialize: function() {
	},
	
	addWinGamePoint: function(idno) {
	    if(idno == 0) return;
	    var member = Members.get(Number(idno));
	    var num = member.get('winnum') + 1;
	    member.save({"winnum": num});
	},

	addLoseGamePoint: function(idno) {
	    if(idno == 0) return;
	    var member = Members.get(Number(idno));
	    var num = member.get('losenum') + 1;
	    member.save({"losenum": num});
	},
	addDrawGamePoint: function(idno) {
	    if(idno == 0) return;
	    var member = Members.get(Number(idno));
	    var num = member.get('drawnum') + 1;
	    member.save({"drawnum": num});
	},

	render: function() {
	    var result_s = '';
	    var result_p = '';
	    var addWinGamePoint = this.addWinGamePoint;
	    var addLoseGamePoint = this.addLoseGamePoint;
	    var addDrawGamePoint = this.addDrawGamePoint;
	    Members.each(function(member) {
		member.set({'winnum' : 0});
		member.set({'losenum' : 0});
		member.set({'drawnum' : 0});
	    });
	    
	    Games.each(function(game) {		
		if( game.get('hantei') != 0 ) {
		    result_s += '第' + game.get('id') + "試合\n";
		    var r1 = "";
		    var r2 = "";		

		    if( game.get('hantei') == 1 ) {
			r1 = "○";
			r2 = "×";
			addWinGamePoint(game.get('leftone'));
			addWinGamePoint(game.get('lefttwo'));
			addLoseGamePoint(game.get('rightone'));
			addLoseGamePoint(game.get('righttwo'));
		    } else if(game.get('hantei') == 2) {
			r1 = "×";
			r2 = "○";
			addLoseGamePoint(game.get('leftone'));
			addLoseGamePoint(game.get('lefttwo'));
			addWinGamePoint(game.get('rightone'));
			addWinGamePoint(game.get('righttwo'));
		    } else if(game.get('hantei') == 3) {
			r1 = "△";
			r2 = "△";
			addDrawGamePoint(game.get('leftone'));
			addDrawGamePoint(game.get('lefttwo'));
			addDrawGamePoint(game.get('rightone'));
			addDrawGamePoint(game.get('righttwo'));
		    }
		    result_s += game.get('leftone') + (game.get('lefttwo') > 0 ? ',' + game.get('lefttwo') : '') + '(' + r1 + ')' + ' VS ' + game.get('rightone') + (game.get('righttwo') > 0 ? ',' + game.get('righttwo') : '') + '(' + r2 +')' + "\n";
		}
	    });

	    Members.each(function(member) {
		result_p +=member.get('member_name') + ' さん ' + member.get('winnum') + ' 勝 ' + member.get('losenum') + ' 負 ' + member.get('drawnum') + " 分\n"
	    });
	    var now = new Date();
	    this.$el.html(this.template({'year' : now.getFullYear(), 'mon':now.getMonth()+1 , 'day': now.getDate(), 'result_s': result_s, 'result_p' : result_p}));
	    return this;
	},
    });

    
    // Our overall **AppView** is the top-level piece of UI.
    // トップレベルのViewとして、AppViewを定義
    var AppView = Backbone.View.extend({

	// Instead of generating a new element, bind to the existing skeleton of
	// the App already present in the HTML.
	// 既に定義済のHTML要素にAppViewは適応することにする
	el: $("body"),

	// Our template for the line of statistics at the bottom of the app.
	// 下の方で残り○タスクって表示するところのためのテンプレ
	statsTemplate: _.template($('#stats-template').html()),

	// Delegated events for creating new items, and clearing completed ones.
	// 新タスクの作成のイベントなど、AppViewで監視するイベントなどなど
	events: {
	    "click #sb1": "openSetteiDialog",
	    "click #b1":  "setGames",
	    "click #b2":  "createOnEnter",
	    "click #sb3":  "OpenMailDialog",
	    "click #b4":  "saveAllModel",
	    "click #clear-completed": "clearCompleted",
	    "click #toggle-all": "toggleAllComplete"
	},

	// At initialization we bind to the relevant events on the `Games`
	// collection, when items are added or changed. Kick things off by
	// loading any preexisting todos that might be saved in *localStorage*.
	// CollectionのイベントをlistenToすることで、Viewをrenderする算段
	// 最後のfetchが実行されると、Collectionのresetイベントが発火してaddAll関数実行！	

	OpenMailDialog: function() {
	    var mailview = new MailView();
	    this.$("div#s4contes").html(mailview.render().el).trigger("create");
	},
	openSetteiDialog: function() {
	    var sgv = new SetteiGamenView( {model: SetteiModel.get(0)} );
	    this.$("div#s1contents").html(sgv.render().el).trigger("create");
	},

	setGames: function(options) {

	    if(SetteiModel.length > 0) {
		var model;
		while (model = SetteiModel.first()) {
		    model.destroy();
		}
	    }

	    SetteiModel.create({'id': 0,
				'men' :  $("#select-choice-2").val(), 
				'ninzu' : $("#select-choice-1").val(),
				'doubles': $("#flip-min").val(),
				'to' : 0,
				'limit': 5});

	    if(Members.length > 0) {
		var model;
		while (model = Members.first()) {
		    model.destroy();
		}
	    }

	    this.$("#memberlist").empty();

	    for(var i=0;i<SetteiModel.get(0).get('ninzu');i++) {
		Members.create({"id": Members.nextOrder()});
	    }

	    if(Games.length > 0) {
		var model;
		while (model = Games.first()) {
		    model.destroy();
		}
	    }

	    this.getAjaxData();

	},

	initialize: function(options) {

	    if (typeof options === "undefined") {
		options || (options = {});
		SetteiModel.fetch();
		if(SetteiModel.length == 0) {
		    SetteiModel.create({'id' : 0,
					'men' : 1,
					'ninzu' : 4,
					'doubles': 1,
					'to' : 0,
					'limit': 5});
		}
	    } else {
		var model ;
		if(SetteiModel.length == 0) {
		    model = new Settei();
		} else {
		    model = SetteiModel.get(0);
		}
		model.set({'id' : 0});
		model.set({'men' : options.men});
		model.set({'ninzu' : options.ninzu});
		model.set({'doubles': options.doubles});
		model.set({'to' :options.to});
	        model.set({'limit': options.limit});
		if(SetteiModel.length == 0) {
		   SetteiModel.add(model);
		} else {
		    model.save();
		}
		this.getAjaxData();
	    }

	    this.on('add', this.callback);	
	    this.input = this.$("#new-todo");
	    this.allCheckbox = this.$("#toggle-all")[0];

	    this.listenTo(Members, 'add', this.MemberAddOne);
	    this.listenTo(Members, 'reset', this.MemberAddAll);
	    this.listenTo(Members, 'all', this.render);

	    this.listenTo(Games, 'add', this.addOne);
	    this.listenTo(Games, 'reset', this.addAll);
	    this.listenTo(Games, 'all', this.render);

	    this.footer = this.$('footer');
	    this.main = $('#main');

	    Members.fetch();
	    Games.fetch();

	    if(Games.length == 0) {
		$('body').pagecontainer('change', '#s1');
	    }

	},

	callback: function(){  // Collectionに追加がある度実行される
            console.log('happen add event');　
	},

	// Re-rendering the App just means refreshing the statistics -- the rest
	// of the app doesn't change.
	// ここでは残りタスク数の整理だけを行う
	render: function() {
	},

	MemberAddOne: function(todo) {
	    var view = new MembersView({model: todo});	    
	    this.$("#memberlist").append(view.render().el);
	},

	// Add all items in the **Todos** collection at once.
	// Collectionの中のModelの分だけaddOne関数
	MemberAddAll: function() {
	    Members.each(this.MemberAddOne, this);
	},


	addOne: function(todo) {
	    var view = new GamesView({model: todo});
	    this.$("#todo-list").append(view.render().el);
	},

	// Add all items in the **Todos** collection at once.
	// Collectionの中のModelの分だけaddOne関数
	addAll: function() {
	    Games.each(this.addOne, this);
	},

	// Create
	//
	createOnEnter: function() {
	    var model = SetteiModel.get(0);
	    model.set({'to' : Games.nextOrder()-1});
	    model.save();
	    this.getAjaxData()
	},

	getAjaxData: function() {
//	    var myview = this;
	    var model = SetteiModel.get(0);
	    $.ajax({
		type: "GET",
		url: model.get('ninzu') + ".csv",
		cache: false,
		success: function(data, status) {
		    var ret = new Array(model.get('limit'));
		    var kumiawase = csv2json(data);

		    
		    if(model.get('men') > Math.floor(model.get('ninzu') / (model.get('doubles') ==1 ? 4 : 2))) {
			model.get('men') = Math.floor(model.get('ninzu') / (model.get('doubles')== 1 ? 4 : 2));
		    }
		    var okuri = (model.get('doubles') == 1 ? 2 : 1) * model.get('men');
		    var kai=0;

		    var start_index = model.get('to') * okuri;
		    if(start_index >= kumiawase.length) {
			start_index = start_index % kumiawase.length;
		    }

		    for(var i=0;i<model.get('limit') ;i++) {
			var tmp = new Array((model.get('doubles')==1 ? 4 : 2) * model.get('men'));
			for(var l=0;l<model.get('men');l++) {
			    for(var j=0;j<(model.get('doubles')==1 ? 4 : 2);j++) {
				if((model.get('doubles')==1) && (j==2)) {
				    start_index += 1;
				}
				if(start_index >= kumiawase.length) {
				    start_index = 0;
				}
				tmp[(model.get('doubles')==1 ? 4 : 2)*l+j]=kumiawase[start_index][j % 2];
			    }
			    start_index += 1;
			}
			var tmp2;
			if(model.get('doubles')==1) {
			    tmp2 = {"id": Games.nextOrder(),"leftone": tmp[0], "lefttwo":tmp[1], "rightone": tmp[2], "righttwo": tmp[3]};
			} else {
			    tmp2 = {"id": Games.nextOrder(),"leftone": tmp[0], "rightone": tmp[2]};
			}
			Games.create(tmp2);
		    }

		},
		error: function(data, status) {
		    alert (status + ":" + data );
		}
            });
        },
	saveOneModel: function(member) {
	    var tmp = '#member_' + member.id;
	    var tmp2 = this.$el.find(tmp).val();
	    member.set({"member_name" : tmp2});
	    member.save();
	},
	saveAllModel: function()  {
	    Members.each(this.saveOneModel,this);
	}
    });

    // Finally, we kick things off by creating the **App**.
    // 最後にAppViewをインスタンス化
    //    var App = new AppView({"ninzu":6, "doubles":1, "men":1, "to":0, "limit":5});

    var App  = new AppView();    
});
