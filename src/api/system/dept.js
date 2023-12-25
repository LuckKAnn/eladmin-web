import request from '@/utils/request'

export function getDepts(params) {
  return request({
    url: 'api/dept',
    method: 'get',
    params
  })
}

export function getPath(params) {
  console.log("this vis path"+ params)
  return request({
    url: 'process/path?path=' + params,
    method: 'get'
  })
}
export function getFaultGraph() {
  return request({
    url: 'graph/list',
    method: 'get'
  })
}
export function processFile(params) {
  return request({
    url: 'process/path?path=' + params,
    method: 'post'
  })
}

export function getDeptSuperior(ids, exclude) {
  exclude = exclude !== undefined ? exclude : false
  const data = ids.length || ids.length === 0 ? ids : Array.of(ids)
  return request({
    url: 'api/dept/superior?exclude=' + exclude,
    method: 'post',
    data
  })
}

export function add(data) {
  return request({
    url: 'api/dept',
    method: 'post',
    data
  })
}

export function del(ids) {
  return request({
    url: 'api/dept',
    method: 'delete',
    data: ids
  })
}

export function edit(data) {
  return request({
    url: 'api/dept',
    method: 'put',
    data
  })
}

export default { add, edit, del, getDepts, getDeptSuperior }
