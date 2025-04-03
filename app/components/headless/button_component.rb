# frozen_string_literal: true

module Headless
  class ButtonComponent < ApplicationComponent
    jsx_mapping file: "button", component: "Button"

    def initialize(disabled: false, hover: false, focus: false, active: false, autofocus: false)
    end
  end
end
