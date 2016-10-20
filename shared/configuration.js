const [, query = ''] = document.location.href.split('?')
const configuration = query.split('&').map(q => q.split('=')).reduce((result, [k, v]) => Object.assign(result, { [k]: v }), {})
