// Browser page translation (Chrome offers it for Uzbek pages) and some
// extensions wrap or move text nodes React rendered. React then removes or
// inserts beside a node whose parent changed, the browser throws
// NotFoundError, and the page breaks (removeChild / insertBefore in
// /admin/errors). This is React's documented workaround
// (facebook/react#11538): skip the call when the node has moved instead of
// throwing, so a translated page keeps working. It runs before hydration.
const GUARD = `(function(){if(typeof Node!=="function"||!Node.prototype||Node.prototype.__cvGuard)return;var p=Node.prototype,r=p.removeChild,i=p.insertBefore;p.removeChild=function(c){if(c&&c.parentNode!==this)return c;return r.apply(this,arguments)};p.insertBefore=function(n,b){if(b&&b.parentNode!==this)return n;return i.apply(this,arguments)};p.__cvGuard=true})();`;

/** Put first in <body> of every root layout. */
export function DomGuard() {
  return <script dangerouslySetInnerHTML={{ __html: GUARD }} />;
}
