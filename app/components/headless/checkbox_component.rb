# frozen_string_literal: true

module Headless
  class CheckboxComponent < ApplicationComponent
    jsx_mapping file: "checkbox", component: "Checkbox"

    def initialize(**options)
      super(**options)
    end
  end
end
