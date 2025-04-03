# frozen_string_literal: true

module Headless
  class CheckboxComponent < ApplicationComponent
    jsx_mapping file: "checkbox", component: "Checkbox"

    def initialize(disabled: false, hover: false, focus: false, active: false, autofocus: false)
    end
  end
end
