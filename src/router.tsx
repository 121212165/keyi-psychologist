import { Route, Switch, useLocation } from 'wouter';
import WelcomePage from '@/pages/welcome';
import ChatPage from '@/pages/chat';
import ClosingPage from '@/pages/closing';

/**
 * 路由配置
 */
export function Router() {
  return (
    <Switch>
      <Route path="/" component={WelcomePage} />
      <Route path="/chat/intro" component={ChatPage} />
      <Route path="/chat" component={ChatPage} />
      <Route path="/closing" component={ClosingPage} />
      <Route>
        <div className="min-h-screen flex items-center justify-center bg-primary-50">
          <p className="text-warm-600">页面未找到</p>
        </div>
      </Route>
    </Switch>
  );
}

// 导出 navigate 用于编程式导航
export const navigate = (path: string) => {
  window.history.pushState(null, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
};
