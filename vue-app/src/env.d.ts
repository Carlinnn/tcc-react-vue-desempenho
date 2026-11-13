declare const __LAZY__: boolean;
declare const __COND__: boolean;
declare module '@routes' {
  import type { RouteRecordRaw } from 'vue-router';
  export const routes: RouteRecordRaw[];
}
declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const c: DefineComponent;
  export default c;
}
