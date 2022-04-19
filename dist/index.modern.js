import { useRef, useEffect, createElement } from 'react';

var styles = {"stickySidebar":"_styles-module__stickySidebar__wEBSf","sidebar":"_styles-module__sidebar__a1FEy","sidebarInner":"_styles-module__sidebarInner__3c2CD"};

const EVENT_KEY = '.stickySidebar';
const DEFAULTS = {
  topSpacing: 0,
  bottomSpacing: 0,
  containerSelector: false,
  innerWrapperSelector: '.inner-wrapper-sticky',
  stickyClass: 'is-affixed',
  resizeSensor: true,
  minWidth: false
};

class StickySidebar {
  constructor(sidebar, options = {}) {
    this.options = StickySidebar.extend(DEFAULTS, options);
    this.sidebar = typeof sidebar === 'string' ? document.querySelector(sidebar) : sidebar;
    if (typeof this.sidebar === 'undefined') throw new Error('There is no specific sidebar element.');
    this.sidebarInner = false;
    this.container = this.sidebar.parentElement;
    this.affixedType = 'STATIC';
    this.direction = 'down';
    this.support = {
      transform: false,
      transform3d: false
    };
    this._initialized = false;
    this._reStyle = false;
    this._breakpoint = false;
    this.dimensions = {
      translateY: 0,
      maxTranslateY: 0,
      topSpacing: 0,
      lastTopSpacing: 0,
      bottomSpacing: 0,
      lastBottomSpacing: 0,
      sidebarHeight: 0,
      sidebarWidth: 0,
      containerTop: 0,
      containerHeight: 0,
      viewportHeight: 0,
      viewportTop: 0,
      lastViewportTop: 0
    };
    ['handleEvent'].forEach(method => {
      this[method] = this[method].bind(this);
    });
    this.initialize();
  }

  initialize() {
    this._setSupportFeatures();

    if (this.options.innerWrapperSelector) {
      this.sidebarInner = this.sidebar.querySelector(this.options.innerWrapperSelector);
      if (this.sidebarInner === null) this.sidebarInner = false;
    }

    if (!this.sidebarInner) {
      const wrapper = document.createElement('div');
      wrapper.setAttribute('class', 'inner-wrapper-sticky');
      this.sidebar.appendChild(wrapper);

      while (this.sidebar.firstChild != wrapper) wrapper.appendChild(this.sidebar.firstChild);

      this.sidebarInner = this.sidebar.querySelector('.inner-wrapper-sticky');
    }

    if (this.options.containerSelector) {
      let containers = document.querySelectorAll(this.options.containerSelector);
      containers = Array.prototype.slice.call(containers);
      containers.forEach((container, item) => {
        if (!container.contains(this.sidebar)) return;
        this.container = container;
      });
      if (!containers.length) throw new Error('The container does not contains on the sidebar.');
    }

    if (typeof this.options.topSpacing !== 'function') this.options.topSpacing = parseInt(this.options.topSpacing) || 0;
    if (typeof this.options.bottomSpacing !== 'function') this.options.bottomSpacing = parseInt(this.options.bottomSpacing) || 0;

    this._widthBreakpoint();

    this.calcDimensions();
    this.stickyPosition();
    this.bindEvents();
    this._initialized = true;
  }

  bindEvents() {
    window.addEventListener('resize', this, {
      passive: true,
      capture: false
    });
    window.addEventListener('scroll', this, {
      passive: true,
      capture: false
    });
    this.sidebar.addEventListener('update' + EVENT_KEY, this);
  }

  handleEvent(event) {
    this.updateSticky(event);
  }

  calcDimensions() {
    if (this._breakpoint) return;
    var dims = this.dimensions;
    dims.containerTop = StickySidebar.offsetRelative(this.container).top;
    dims.containerHeight = this.container.clientHeight;
    dims.containerBottom = dims.containerTop + dims.containerHeight;
    dims.sidebarHeight = this.sidebarInner.offsetHeight;
    dims.sidebarWidth = this.sidebarInner.offsetWidth;
    dims.viewportHeight = window.innerHeight;
    dims.maxTranslateY = dims.containerHeight - dims.sidebarHeight;

    this._calcDimensionsWithScroll();
  }

  _calcDimensionsWithScroll() {
    var dims = this.dimensions;
    dims.sidebarLeft = StickySidebar.offsetRelative(this.sidebar).left;
    dims.viewportTop = document.documentElement.scrollTop || document.body.scrollTop;
    dims.viewportBottom = dims.viewportTop + dims.viewportHeight;
    dims.viewportLeft = document.documentElement.scrollLeft || document.body.scrollLeft;
    dims.topSpacing = this.options.topSpacing;
    dims.bottomSpacing = this.options.bottomSpacing;
    if (typeof dims.topSpacing === 'function') dims.topSpacing = parseInt(dims.topSpacing(this.sidebar)) || 0;
    if (typeof dims.bottomSpacing === 'function') dims.bottomSpacing = parseInt(dims.bottomSpacing(this.sidebar)) || 0;

    if (this.affixedType === 'VIEWPORT-TOP') {
      if (dims.topSpacing < dims.lastTopSpacing) {
        dims.translateY += dims.lastTopSpacing - dims.topSpacing;
        this._reStyle = true;
      }
    } else if (this.affixedType === 'VIEWPORT-BOTTOM') {
      if (dims.bottomSpacing < dims.lastBottomSpacing) {
        dims.translateY += dims.lastBottomSpacing - dims.bottomSpacing;
        this._reStyle = true;
      }
    }

    dims.lastTopSpacing = dims.topSpacing;
    dims.lastBottomSpacing = dims.bottomSpacing;
  }

  isSidebarFitsViewport() {
    const dims = this.dimensions;
    const offset = this.scrollDirection === 'down' ? dims.lastBottomSpacing : dims.lastTopSpacing;
    return this.dimensions.sidebarHeight + offset < this.dimensions.viewportHeight;
  }

  observeScrollDir() {
    var dims = this.dimensions;
    if (dims.lastViewportTop === dims.viewportTop) return;
    var furthest = this.direction === 'down' ? Math.min : Math.max;
    if (dims.viewportTop === furthest(dims.viewportTop, dims.lastViewportTop)) this.direction = this.direction === 'down' ? 'up' : 'down';
  }

  getAffixType() {
    this._calcDimensionsWithScroll();

    var dims = this.dimensions;
    var colliderTop = dims.viewportTop + dims.topSpacing;
    var affixType = this.affixedType;

    if (colliderTop <= dims.containerTop || dims.containerHeight <= dims.sidebarHeight) {
      dims.translateY = 0;
      affixType = 'STATIC';
    } else {
      affixType = this.direction === 'up' ? this._getAffixTypeScrollingUp() : this._getAffixTypeScrollingDown();
    }

    dims.translateY = Math.max(0, dims.translateY);
    dims.translateY = Math.min(dims.containerHeight, dims.translateY);
    dims.translateY = Math.round(dims.translateY);
    dims.lastViewportTop = dims.viewportTop;
    return affixType;
  }

  _getAffixTypeScrollingDown() {
    var dims = this.dimensions;
    var sidebarBottom = dims.sidebarHeight + dims.containerTop;
    var colliderTop = dims.viewportTop + dims.topSpacing;
    var colliderBottom = dims.viewportBottom - dims.bottomSpacing;
    var affixType = this.affixedType;

    if (this.isSidebarFitsViewport()) {
      if (dims.sidebarHeight + colliderTop >= dims.containerBottom) {
        dims.translateY = dims.containerBottom - sidebarBottom;
        affixType = 'CONTAINER-BOTTOM';
      } else if (colliderTop >= dims.containerTop) {
        dims.translateY = colliderTop - dims.containerTop;
        affixType = 'VIEWPORT-TOP';
      }
    } else {
      if (dims.containerBottom <= colliderBottom) {
        dims.translateY = dims.containerBottom - sidebarBottom;
        affixType = 'CONTAINER-BOTTOM';
      } else if (sidebarBottom + dims.translateY <= colliderBottom) {
        dims.translateY = colliderBottom - sidebarBottom;
        affixType = 'VIEWPORT-BOTTOM';
      } else if (dims.containerTop + dims.translateY <= colliderTop && dims.translateY !== 0 && dims.maxTranslateY !== dims.translateY) {
        affixType = 'VIEWPORT-UNBOTTOM';
      }
    }

    return affixType;
  }

  _getAffixTypeScrollingUp() {
    var dims = this.dimensions;
    var sidebarBottom = dims.sidebarHeight + dims.containerTop;
    var colliderTop = dims.viewportTop + dims.topSpacing;
    var colliderBottom = dims.viewportBottom - dims.bottomSpacing;
    var affixType = this.affixedType;

    if (colliderTop <= dims.translateY + dims.containerTop) {
      dims.translateY = colliderTop - dims.containerTop;
      affixType = 'VIEWPORT-TOP';
    } else if (dims.containerBottom <= colliderBottom) {
      dims.translateY = dims.containerBottom - sidebarBottom;
      affixType = 'CONTAINER-BOTTOM';
    } else if (!this.isSidebarFitsViewport()) {
      if (dims.containerTop <= colliderTop && dims.translateY !== 0 && dims.maxTranslateY !== dims.translateY) {
        affixType = 'VIEWPORT-UNBOTTOM';
      }
    }

    return affixType;
  }

  _getStyle(affixType) {
    if (typeof affixType === 'undefined') return;
    var style = {
      inner: {},
      outer: {}
    };
    var dims = this.dimensions;

    switch (affixType) {
      case 'VIEWPORT-TOP':
        style.inner = {
          position: 'fixed',
          top: dims.topSpacing,
          left: dims.sidebarLeft - dims.viewportLeft,
          width: dims.sidebarWidth
        };
        break;

      case 'VIEWPORT-BOTTOM':
        style.inner = {
          position: 'fixed',
          top: 'auto',
          left: dims.sidebarLeft,
          bottom: dims.bottomSpacing,
          width: dims.sidebarWidth
        };
        break;

      case 'CONTAINER-BOTTOM':
      case 'VIEWPORT-UNBOTTOM':
        const translate = this._getTranslate(0, dims.translateY + 'px');

        if (translate) style.inner = {
          transform: translate
        };else style.inner = {
          position: 'absolute',
          top: dims.translateY,
          width: dims.sidebarWidth
        };
        break;
    }

    switch (affixType) {
      case 'VIEWPORT-TOP':
      case 'VIEWPORT-BOTTOM':
      case 'VIEWPORT-UNBOTTOM':
      case 'CONTAINER-BOTTOM':
        style.outer = {
          height: dims.sidebarHeight,
          position: 'relative'
        };
        break;
    }

    style.outer = StickySidebar.extend({
      height: '',
      position: ''
    }, style.outer);
    style.inner = StickySidebar.extend({
      position: 'relative',
      top: '',
      left: '',
      bottom: '',
      width: '',
      transform: ''
    }, style.inner);
    return style;
  }

  stickyPosition(force) {
    if (this._breakpoint) return;
    force = this._reStyle || force || false;
    var affixType = this.getAffixType();

    var style = this._getStyle(affixType);

    if ((this.affixedType != affixType || force) && affixType) {
      const affixEvent = 'affix.' + affixType.toLowerCase().replace('viewport-', '') + EVENT_KEY;
      StickySidebar.eventTrigger(this.sidebar, affixEvent);
      if (affixType === 'STATIC') StickySidebar.removeClass(this.sidebar, this.options.stickyClass);else StickySidebar.addClass(this.sidebar, this.options.stickyClass);

      for (const key in style.outer) {
        const unit = typeof style.outer[key] === 'number' ? 'px' : '';
        this.sidebar.style[key] = style.outer[key] + unit;
      }

      for (const key in style.inner) {
        const unit = typeof style.inner[key] === 'number' ? 'px' : '';
        this.sidebarInner.style[key] = style.inner[key] + unit;
      }

      const affixedEvent = 'affixed.' + affixType.toLowerCase().replace('viewport-', '') + EVENT_KEY;
      StickySidebar.eventTrigger(this.sidebar, affixedEvent);
    } else {
      if (this._initialized) this.sidebarInner.style.left = style.inner.left;
    }

    this.affixedType = affixType;
  }

  _widthBreakpoint() {
    if (window.innerWidth <= this.options.minWidth) {
      this._breakpoint = true;
      this.affixedType = 'STATIC';
      this.sidebar.removeAttribute('style');
      StickySidebar.removeClass(this.sidebar, this.options.stickyClass);
      this.sidebarInner.removeAttribute('style');
    } else {
      this._breakpoint = false;
    }
  }

  updateSticky(event = {}) {
    if (this._running) return;
    this._running = true;

    (eventType => {
      requestAnimationFrame(() => {
        switch (eventType) {
          case 'scroll':
            this._calcDimensionsWithScroll();

            this.observeScrollDir();
            this.stickyPosition();
            break;

          case 'resize':
          default:
            this._widthBreakpoint();

            this.calcDimensions();
            this.stickyPosition(true);
            break;
        }

        this._running = false;
      });
    })(event.type);
  }

  _setSupportFeatures() {
    var support = this.support;
    support.transform = StickySidebar.supportTransform();
    support.transform3d = StickySidebar.supportTransform(true);
  }

  _getTranslate(y = 0, x = 0, z = 0) {
    if (this.support.transform3d) return 'translate3d(' + y + ', ' + x + ', ' + z + ')';else if (this.support.translate) return 'translate(' + y + ', ' + x + ')';else return false;
  }

  destroy() {
    window.removeEventListener('resize', this, {
      capture: false
    });
    window.removeEventListener('scroll', this, {
      capture: false
    });
    this.sidebar.classList.remove(this.options.stickyClass);
    this.sidebar.style.minHeight = '';
    this.sidebar.removeEventListener('update' + EVENT_KEY, this);
    var styleReset = {
      inner: {},
      outer: {}
    };
    styleReset.inner = {
      position: '',
      top: '',
      left: '',
      bottom: '',
      width: '',
      transform: ''
    };
    styleReset.outer = {
      height: '',
      position: ''
    };

    for (const key in styleReset.outer) this.sidebar.style[key] = styleReset.outer[key];

    for (const key in styleReset.inner) this.sidebarInner.style[key] = styleReset.inner[key];
  }

  static supportTransform(transform3d) {
    var result = false;
    var property = transform3d ? 'perspective' : 'transform';
    var upper = property.charAt(0).toUpperCase() + property.slice(1);
    var prefixes = ['Webkit', 'Moz', 'O', 'ms'];
    var support = document.createElement('support');
    var style = support.style;
    (property + ' ' + prefixes.join(upper + ' ') + upper).split(' ').forEach(function (property, i) {
      if (style[property] !== undefined) {
        result = property;
        return false;
      }
    });
    return result;
  }

  static eventTrigger(element, eventName, data) {
    try {
      var event = new CustomEvent(eventName, {
        detail: data
      });
    } catch (e) {
      var event = document.createEvent('CustomEvent');
      event.initCustomEvent(eventName, true, true, data);
    }

    element.dispatchEvent(event);
  }

  static extend(defaults, options) {
    var results = {};

    for (const key in defaults) {
      if (typeof options[key] !== 'undefined') results[key] = options[key];else results[key] = defaults[key];
    }

    return results;
  }

  static offsetRelative(element) {
    var result = {
      left: 0,
      top: 0
    };

    do {
      const offsetTop = element.offsetTop;
      const offsetLeft = element.offsetLeft;
      if (!isNaN(offsetTop)) result.top += offsetTop;
      if (!isNaN(offsetLeft)) result.left += offsetLeft;
      element = element.tagName === 'BODY' ? element.parentElement : element.offsetParent;
    } while (element);

    return result;
  }

  static addClass(element, className) {
    if (!StickySidebar.hasClass(element, className)) {
      if (element.classList) element.classList.add(className);else element.className += ' ' + className;
    }
  }

  static removeClass(element, className) {
    if (StickySidebar.hasClass(element, className)) {
      if (element.classList) element.classList.remove(className);else element.className = element.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
    }
  }

  static hasClass(element, className) {
    if (element.classList) return element.classList.contains(className);else return new RegExp('(^| )' + className + '( |$)', 'gi').test(element.className);
  }

  static get defaults() {
    return DEFAULTS;
  }

}

const StickySidebar$1 = ({
  bottomSpacing: _bottomSpacing = 0,
  content,
  id: _id = 'container',
  sidebarContent,
  sidebarId: _sidebarId = 'sidebar',
  sidebarInnerId: _sidebarInnerId = 'sidebar-inner',
  topSpacing: _topSpacing = 0
}) => {
  const sidebarImplementation = useRef();
  useEffect(() => {
    sidebarImplementation.current = new StickySidebar(`#${_sidebarId}`, {
      containerSelector: `#${_id}`,
      innerWrapperSelector: `#${_sidebarInnerId}`,
      topSpacing: _topSpacing,
      bottomSpacing: _bottomSpacing
    });
  }, [_id, _sidebarId, _sidebarInnerId]);
  return createElement("div", {
    id: _id,
    className: `sticky-sidebar ${styles.stickySidebar}`
  }, createElement("div", {
    id: _sidebarId,
    className: `sticky-sidebar__sidebar ${styles.sidebar}`
  }, createElement("div", {
    id: _sidebarInnerId,
    className: `sticky-sidebar__sidebar-inner ${styles.sidebarInner}`
  }, sidebarContent === null || sidebarContent === void 0 ? void 0 : sidebarContent())), createElement("div", {
    className: 'sticky-sidebar__content'
  }, content === null || content === void 0 ? void 0 : content()));
};

export default StickySidebar$1;
//# sourceMappingURL=index.modern.js.map
