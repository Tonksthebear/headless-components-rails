module Headless
  class TestComponent < ApplicationComponent
    renders_many :inners, "Headless::TestComponent::InnerComponent"

    class InnerComponent < ApplicationComponent
      def call
        content
      end
    end
  end
end