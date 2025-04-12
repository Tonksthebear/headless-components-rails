import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  stringOrNull(value) {
    if (value === null || value === undefined || value === "") {
      return null
    }
    return value
  }
}
