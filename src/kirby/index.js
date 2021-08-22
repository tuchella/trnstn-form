panel.plugin("trnstn/trnstnform'", {
    views: {
      artistForm: {
        label: "Form",
        icon: "template",
        component: {
          template: `
            <k-view class="k-todos-view">
              <k-header>
                  You are being redirected...
              </k-header>
  
              If not click <a href="/form">here</a>.
  
            </k-view>
          `,
            mounted() {
                window.location.href = "/form/shows";
            }
        }
      }
    }
  });