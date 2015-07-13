/**
*  it's a simple web-app frame by using js
 *  author: cai.liao
 *  email:  debris1@163.com
*/
'use strict';
var Debris, D;

var utils =(function(){

    var el =null;

    var extend = function _extend(opt1,opt2){
        if(opt1==null||opt2==null)
            return;

        for (var name in opt2) {
            opt1[name] = opt2[name];
        }

        return opt1;
    };

    var querySingle = function _querySingle(selector){
        return this.el = (typeof selector === 'string')? document.querySelector(selector):selector;
    };

    var getStyle = function(attr){
        var obj =this.el;
        if(obj!=null && typeof attr !==  'string')
            return null;

        if(arguments.length < 2){
            //ie need use currentStyle,but no needed in there
            return document.defaultView.getComputedStyle(obj,null)[attr];
        }else{
            var val = arguments[1];
            if(typeof val ===  'string'){
                obj.style[attr] = val;
            }
        }
    };

    var findClass = function(_class){
        if(!this.el||(arguments.length===1&&typeof _class !=='string'))
            return false;
        if(arguments.length>1){
            _class = arguments[1];
            return arguments[0].className.match(new RegExp('(\\s|^)' + _class + '(\\s|$)'))!=null;
        }
        return this.el.className.match(new RegExp('(\\s|^)' + _class + '(\\s|$)'))!=null;
    };

    var addClass = function(_class){

        if(!this.el||(arguments.length===1&&typeof _class !=='string'))
            return false;
        if(arguments.length>1){
            _class = arguments[1];
            if(!this.hasClass(arguments[0],_class)){
                arguments[0].className += (arguments[0].className?' ':'') + _class;
            }

            return;
        }
        if(!this.hasClass(_class))
            this.el.className += (this.el.className?' ':'') + _class;
    };

    var removeClass = function(_class){
        if(!this.el||(arguments.length==1&&typeof _class !='string'))
            return false;
        if(arguments.length>1){
            _class = arguments[1];
            if(this.hasClass(arguments[0],_class)){
                arguments[0].className = arguments[0].className.replace(new RegExp('(\\s|^)' + _class + '(\\s|$)'),function(str,str1,str2){
                    if(str1&&str2){
                        return ' ';
                    }else{
                        return '';
                    }
                });
                return;
            }
        }

        if(this.hasClass(_class)){
            this.el.className = this.el.className.replace(new RegExp('(\\s|^)' + _class + '(\\s|$)'),' ');
        }
    };

    //_listeners store up the info of selector and functions
    var _listeners = {};
    var _eventHandler ={};

    var addEvent = function(_type,_selector,_fn) {
        var type =_type,selector = _selector,fn =_fn;

        if(arguments.length===2){
            fn = _selector;
            selector = document;
        }
        if(typeof type !== 'string'||!selector||typeof fn !== "function") return false;

        if(!this._(_selector)) return false;

        //init event
        if (typeof _eventHandler[type] === "undefined") {
            _eventHandler[type] = [];
            var event = document.createEvent('Event');
            event.initEvent(type,true,true);
            _eventHandler[type] = event;
        }

        if(!_listeners[type])
            _listeners[type]=[];
        _listeners[type].push({selector:selector,fn:fn});

        //only 2 arguments
        if(selector==document){
            this._(selector).addEventListener(type,fn);
        }
        else{
            var selectors = document.querySelectorAll(selector);
            for(var i=0;i<selectors.length;i++){
                selectors[i].addEventListener(type,fn);
            }
        }
        return true;
    };

    var fireEvent = function(type,selector) {

        //init event
        if (typeof _eventHandler[type] === "undefined") {
            _eventHandler[type] = [];
            var event = document.createEvent('Event');
            event.initEvent(type,true,true);
            _eventHandler[type] = event;
        }

            if (typeof type !== 'undefined' && _eventHandler[type] && typeof selector !== 'undefined') {
                this._(selector).dispatchEvent(_eventHandler[type]);
            }

        };

    var removeEvent = function(type, fn) {
            var arrayEvent = _listeners[type];

            if (typeof type === "string" && arrayEvent instanceof Array) {
                if (typeof fn === "function") {
                    for (var i=0, length=arrayEvent.length; i<length; i++){
                        if (arrayEvent[i]['fn'] === fn){
                            this._(arrayEvent[i]['selector']).removeEventListener(type,fn);
                            _listeners[type].splice(i, 1);
                            break;
                        }
                    }
                } else {
                    for (var i=0, length=arrayEvent.length; i<length; i++){
                        this._(arrayEvent[i]['selector']).removeEventListener(type,arrayEvent[i]['fn']);
                    }
                    delete _listeners[type];
                    delete _eventHandler[type];
                }
            }
        };

    return {
        el:el,
        extend:extend,
        _:querySingle,
        css:getStyle,
        event:Event,
        hasClass:findClass,
        addClass:addClass,
        removeClass:removeClass,
        on:addEvent,
        off:removeEvent,
        trigger:fireEvent
    };
})();

Debris=D={
    version:'0.0',
    options:{
        //是否需要加载页面片段，false代表已经加载
        isLoad:true,
        //是否需要加载欢迎页面
        isShowWelcome:true,
        sectionAnimate:'slide',
        basePagePath:'html/',
        remotePagePath:{}
    },
    init:function(main_section){
        if(this.options.isShowWelcome){}

        this.UIManage.init(main_section);
    }
};

//Debris 组件定义
(function(){

    //bind event
    /*window.addEventListener('hashchange',)*/

    var _ = utils._.bind(utils);

    //页面组件
    var UI = {
                'icon':'[icon]',
                'checkbox':'[checkbox]',
                'scroll':'[scrollable="true"]',
                'toggle' : '.toggle'
             };
    //kernel
    var vendor = ['webkit','Moz'];
    var current_vendor = "";

    /**
     *  UIManage: UI组件管理
     */
    D.UIManage = (function(){

        for(var v in vendor ){
            if(typeof document.body.style[vendor[v]+'Transition'] === 'string') {
                current_vendor = vendor[v];
                break;
            }
        }

        var init=function(_section){
            /*init main section*/
            _init_section(_section);

            /*init Animation in section*/
            if(!isAnimation) {
                _hide_animate_object(_section);
                _show_section_animate(_section);
            }

            /*init icon*/
            _init_icon();
            /* init checkbox*/
            _init_checkbox();
            /*init scroll*/
            _init_scroll(_section);
        };
        var _init_scroll =function(section){
            var elements = _(section).querySelectorAll(UI['scroll']);

            if(!elements)
                return;
            for (var i = 0; i < elements.length; i++) {
                D.iscroll(elements[i],[]);
            }

            elements =null;
        };
        var _init_icon = function(){

        };
        var  _init_checkbox =function(){

        };
        var _init_section = function(_section){

            if(_section==null||typeof _section != 'string') return;

            var section = _(_section);
            if(section==null) return;

            current_section = _section;
            window.location.hash = _section;

            utils.addClass('active');

            var sections = document.querySelectorAll('section.active');
            var len = sections.length;

            for(var i=0;i<len&&len!=1;i++ ){
                if(sections[i]==section) continue;

                if(_(sections[i]))
                    utils.removeClass('active');
            }

            utils.trigger('pageshow',_section);
            section =null;
            sections =null;
            len = null;
        };

        var _deal_animate = function(children,fn){
            if(!children||!children.dataset.animate) return;
            var animate = children.dataset.animate;
            if(anims[animate]!==undefined){
                var animationend = 'animationend';
                if(current_vendor=='webkit') animationend = 'webkitAnimationEnd';

                children.addEventListener(animationend,fn);
                children.style.visibility = "visible";
                utils.addClass(children,anims[animate]);
            }
        };

        var _hide_animate_object = function(_section){
            if(_section === null||typeof _section !== 'string') return;

            var section = _(_section);
            if(section === null) return;

            if(section.dataset.animateTimes === ''){
                return;
            }

            var childrens = section.querySelectorAll('*[data-animate]');

            if(childrens.length >0){
                for(var i=0;i<childrens.length;i++){
                    childrens[i].style.visibility = 'hidden';
                }
            }
        };

        var _show_section_animate = function(_section){
            if(_section === null||typeof _section !== 'string') return;

            var section = _(_section);
            if(section === null) return;

            if(section.dataset.animateTimes === 'once'){
                section.dataset.animateTimes = '';
            }else if(section.dataset.animateTimes !== 'always'){
                return;
            }

            var childrens = section.querySelectorAll('*[data-animate]');
            var i =0;

            if(childrens.length>0){
                var animationend = 'animationend';
                if(current_vendor=='webkit') animationend = 'webkitAnimationEnd';

                //call this function when animation ended
                var handler= function(){
                    utils.removeClass(this,anims[childrens[i].dataset.animate]);
                    this.removeEventListener(animationend,handler);
                };

                for(var j =0;j<childrens.length;j++){
                    /*childrens[j].style.visibility = 'hidden';*/
                    if(j===0){_deal_animate(childrens[i],handler);}
                    else{
                        setTimeout(function(){
                            i++;
                            _deal_animate(childrens[i],handler);
                        },j*200);
                    }
                }
             }
        };

        return {
            init:init,
            show_section_animate:_show_section_animate,
            hide_animate_object:_hide_animate_object
        };
    })();



    /**
     * Router
     */
     D.router = (function(){

         var animate = D.options.sectionAnimate;
         var _hashchange = function(e){

            var href = window.location.hash;
             D.transition.run(href,animate);
         };

         var _showArticle = function(articleId){
             var article;
             if(articleId.indexOf('#')!=0){
                 console.error('Debris error:showArticle argument is wrong');
                 return false;
             }
              if(!(article = _(current_section).querySelector(articleId))) return false;
             if(!utils.hasClass(article,'active')){
                 var active_article = _(current_section).querySelector('article.active');
                 if(active_article) utils.removeClass(active_article,'active');
                 utils.addClass(article,'active');
             }
             utils.trigger('articleShow',article);
         };

         window.addEventListener('hashchange',_hashchange);

         document.addEventListener('click',function(e){

             var nodeName = e.target.nodeName.toLowerCase();

             if (nodeName != 'a') {
                 return;
             }

             var target =  e.target.dataset.target;
             var href = e.target.getAttribute('href');

             if(!href ||  href === "#"){
                 if(!target){
                     e.preventDefault();
                     return false;
                 }
             }

             switch(target){
                 case 'section':
                     e.preventDefault();
                     animate = e.target.dataset.sectionAnimate?e.target.dataset.sectionAnimate: D.options.sectionAnimate;
                     window.location.hash = href;
                     break;

                 case 'article':
                     e.preventDefault();
                     D.router.showArticle(href);
                     break;

                 case 'back':
                     e.preventDefault();
                     isback = true;
                     window.history.go(-1);
                     break;

                 case 'preview':
                     e.preventDefault();
                     window.history.go(1);
                     break;

                 default :
                     break;
             }
         });

        return {
            showArticle:_showArticle
        };
    })();



    //跳转动画
    var anims ={
        'left':'animation LeftIn',
        'right':'animation RightIn',
        'top':'animation TopIn',
        'bottom':'animation BottomIn',
        'scale':'animation ScaleIn',
        'rotateX':'animation RotateX',
        'rotateX2':'animation RotateX2',
        'rotateY':'animation RotateY',
        'rotateY2':'animation RotateY2',
        'fadeIn':'animation FadeIn',
        'fadeOut':'animation FadeOut'
    };
    var section_anims={
        'slide':[['animation RightOut','animation LeftIn'],['animation LeftOut','animation RightIn']],
        'fade':['animation FadeOut','animation FadeIn'],
        'fadeIn':[['animation FadeOut','animation NoAnimate'],['animation FadeOut','animation FadeIn']]
    };
    var origin_page = 0,cur_page=1;
    var current_section = null,isback=false,isAnimation=false;
    /**
    *   Transition
    *   @param section     transform to the section
    */
    D.transition=(function(){
        var isSingleAnimation = false;

        var _get_animation = function(animate){
            var animates = section_anims[animate];
            if(!animate || !animates) {
                animates = anims[animate];
                if(!animate || !animates) {
                    console.error('Debris.js error:section animate "'+animate+'" is not Found');
                    return;
                }
                console.error('Debris.js error:section animate "'+animate+'" is not Found');
                return;
            }
            if(animate === 'fade'){
                return section_anims[animate];
            }else{
                return isback?animates[1]:animates[0];
            }
        };

        var _run=function(section,animate){
            if(!current_section||typeof section != 'string'||section==current_section)
                return false;

            if(isAnimation) {
                console.error("Debris.js error: Animation is running now,can't animate it  again");
                return;
            }

            isAnimation = true;
            var origin_section,_current;
            var animation = _get_animation(animate);

            var animationend = 'animationend';
            if(current_vendor=='webkit') animationend = 'webkitAnimationEnd';

            //origin page animation
            if(origin_section = _(current_section)){
                var Handler;
                origin_section.addEventListener(animationend,Handler = function(){
                    utils.removeClass(origin_section,animation[origin_page]);
                    origin_section.removeEventListener(animationend,Handler);
                    D.UIManage.init(section);
                    D.UIManage.hide_animate_object(section);
                    /*utils.addClass(_(section),animation[cur_page]);*/

                    //current page animation
                    if(_current =_(section)){
                        var Handler2;

                        _current.addEventListener(animationend,Handler2 = function(){
                            utils.removeClass(_current,animation[cur_page]);
                            D.UIManage.show_section_animate(section);
                            _current.removeEventListener(animationend,Handler2);
                        });
                        utils.addClass(animation[cur_page]);

                    }
                    current_section = section;

                    isAnimation =false;
                    isback = false;
                });

                utils.addClass(animation[origin_page]);
            }


        };



        return {
            run:_run
        };
    })();



    var scrollCache={},scroll_index=1;
    /**
     *   iscroll:滚动组件  use:iscroll v5
     *   @param selector string/DOmObject
     *   @param opts
     */
    D.iscroll=function(selector,opts){
        var scrollId,el,options={
            startx:0,
            starty:0,
            scrollX:false,
            scrollY:true,// 竖向滚动条
            scrollbars: true,   //显示滚动条
		    mouseWheel: true,   //支持滚轮
		    interactiveScrollbars: true,
		    shrinkScrollbars: 'scale',
		    fadeScrollbars: true,    //滚动时可视
            bounceEasing: 'elastic',
            bounceTime: 1200
        };
        if(selector==null)
            return;

        scrollId = _(selector).dataset.scrollid;

        // init and update iscroll
        if(scrollId){
            el = scrollCache[scrollId];
            utils.extend(el.scroller.options,opts);
            el.scroller.refresh();
            return el;
        }else{
            if(utils.css('overflow')!='hidden'){
                utils.css('overflow','hidden');
            }
            scrollId = 'scroll_'+scroll_index++;
            utils.el.dataset.scrollid = scrollId;
            utils.extend(options,opts);
            var scroller = new IScroll(selector,options);
            return scrollCache[scrollId] = {
                scroller:scroller,
                id:scrollId,
                destory:function(){
                    this.scroller.destory();
                    this.id = null;
                    delete scrollCache[this.id];
                }
            };
        }

    }

})();

(function(){

    /**
     *   上拉/下拉组件
     */

})(window.Zepto);
