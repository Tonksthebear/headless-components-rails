module Headless
  class PopoverGroupComponent < ApplicationComponent
    renders_many :popovers, ->(**popover_options) do
      index = popovers.size
      popover_options[:id] ||= @options[:id] + "-popover-#{index}"
      popover_options[:popover_group_id] = @options[:id]
      popover_options[:open] = false if @has_opened_popover && popover_options[:open] == true
      @has_opened_popover = true if popover_options[:open]

      Headless::PopoverComponent.new(as_root: false, **popover_options)
    end

    def initialize(as: :div, **options)
      @as = as
      options[:id] ||= "popover-group-#{object_id}"
      super(**options)
    end

    def before_render
      merge_options!({
        data: {
          controller: "headless--popover-group",
          headless__popover_group_headless__popover_outlet: "[data-popover-group-id='#{@options[:id]}']",
          action: "headless--popover:focusChanged->headless--popover-group#checkFocus"
        }
      })
    end

    def call
      content_tag(@as, content, **@options)
    end
  end
end
