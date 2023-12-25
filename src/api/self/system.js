import request from '@/utils/request'

export function searchDatasetById(id) {
  return request({
    url: 'api/system/dataset/find' + '?id=' + id,
    method: 'get'
  })
}

export function searchEsFunctionById(id) {
  return request({
    url: 'es/code' + '?id=' + id,
    method: 'get'
  })
}

export function initGetInfo(cid1, cid2) {
  return request({
    url: 'milvus/batch' + '?cid1=' + cid1 + '&cid2=' + cid2,
    method: 'get'
  })
}

export function commitFileSearch(commitInfo) {
  return request({
    url: 'process/files',
    method: 'post',
    data: commitInfo
  })
}

export function commitSearch(codes) {
  return request({
    url: 'process/funcInfo',
    method: 'post',
    data: codes
  })
}

export function searchById(id) {
  return request({
    url: 'milvus/get?id=' + id,
    method: 'get'
  })
}
