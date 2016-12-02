export default function matchRoute(location) {
  const routes = {
    '/': {},
    '/route1': {},
    '/route2': {},
    '/route3': {}
  }

  const { pathname } = location
  const result = routes[pathname]

  return {
    route: result,
    isHit: !!result,
    matches: path => pathname === path
  }
}
