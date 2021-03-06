const fetch = require("node-fetch")
const fs = require("fs").promises
const { query, correct } = require("../utils")

class Item {
  constructor(storageHost, meta) {
    this.storageHost = storageHost
    this.exists = meta.Success
    this.meta = correct(meta)
  }

  async download(_fileName) {
    const fileName = _fileName.endsWith(".zip")
      ? _fileName
      : _fileName + ".zip"

    const blob = await fetch(this.meta.blob, {
      method: "GET"
    }).then(res => res.buffer())
    
    await fs.writeFile(fileName, blob)
    return fileName
  }

  extract(fileName, location) {
    // TODO: extract zip
  }

  async upload() {
    if(this.type == "CollectionType") {
      // TODO: uploading in collection
    }
    else {
      throw new Error("this item is not a folder; upload from the reMarkable instance instead")
    }
  }
  
  async update(metadata) {
    Object.assign(this.meta, {
      version: this.meta.version + 1,
      lastModified: new Date().toISOString(),
      ...metadata
    })

    const [ body ] = await query(this.storageHost, {
      api: "document-storage/json/2/upload/update-status",
      method: "PUT",
      body: [correct(this.meta, true)]
    }).then(res => res.json())

    return body.Success
  }

  async remove() {
    const { id, version } = this.meta

    const [ body ] = await query(this.storageHost, {
      api: "document-storage/json/2/delete",
      method: "PUT",
      body: [{
        ID: id,
        Version: version
      }]
    }).then(res => res.json())

    return body.Success
  }
}

/*
	// await extract('reMarkable.zip', { dir: path.join(__dirname, 'reMarkable.pdf') })
 */


module.exports = Item