module Headless
  module TabHelper
    def headless_tab_group(selected_index: 0, vertical: false, manual: false, **options, &block)
      render Headless::Tab::GroupComponent.new(selected_index: selected_index, vertical: vertical, manual: manual, **options), &block
    end

    def headless_tab_list(**options, &block)
      render Headless::Tab::ListComponent.new(**options), &block
    end

    def headless_tab(**options, &block)
      render Headless::TabComponent.new(**options), &block
    end

    def headless_tab_panels(**options, &block)
      render Headless::Tab::PanelsComponent.new(**options), &block
    end

    def headless_tab_panel(**options, &block)
      render Headless::Tab::PanelComponent.new(**options), &block
    end
  end
end
