struct WebView: UIViewRepresentable {
    let urlString: String
    // Callback to handle navigation requests from the web content
    var onNavigation: ((String) -> Void)? = nil

    func makeCoordinator() -> Coordinator {
        Coordinator(parent: self)
    }

    func makeUIView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        config.preferences.setValue(true, forKey: "allowFileAccessFromFileURLs")
        
        let webView = WKWebView(frame: .zero, configuration: config)
        webView.isOpaque = false
        webView.backgroundColor = .clear
        webView.scrollView.backgroundColor = .clear // Keep it transparent
        webView.navigationDelegate = context.coordinator
        return webView
    }

    func updateUIView(_ webView: WKWebView, context: Context) {
        var url: URL?
        
        // Logic to resolve local or remote URL
        if let localUrl = Bundle.main.url(forResource: urlString, withExtension: nil) {
            url = localUrl
        } else {
             // Try splitting extension
             let text = urlString as NSString
             let ext = text.pathExtension
             let name = text.deletingPathExtension
             if !ext.isEmpty, let bundleUrl = Bundle.main.url(forResource: name, withExtension: ext) {
                 url = bundleUrl
             } else if let remoteUrl = URL(string: urlString) {
                 url = remoteUrl
             }
        }

        if let finalUrl = url {
            if finalUrl.isFileURL {
                 // allowingReadAccessTo: finalUrl.deletingLastPathComponent() allows loading sibling assets
                 webView.loadFileURL(finalUrl, allowingReadAccessTo: finalUrl.deletingLastPathComponent())
            } else {
                 let request = URLRequest(url: finalUrl)
                 webView.load(request)
            }
        }
        // Removed CSS injection to preserve native UI/Hotbar
    }

    class Coordinator: NSObject, WKNavigationDelegate {
        var parent: WebView

        init(parent: WebView) {
            self.parent = parent
        }

        func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
            // Check if it's a user-initiated link click
            if navigationAction.navigationType == .linkActivated {
                if let url = navigationAction.request.url {
                     // Extract the filename to use as the "Page ID"
                     let filename = url.lastPathComponent
                     
                     // If we have a handler, delegate the navigation to SwiftUI
                     if let onNav = parent.onNavigation {
                         onNav(filename)
                         decisionHandler(.cancel) // Cancel web navigation
                         return
                     }
                }
            }
            // Allow other navigations (like initial load, frames, JS)
            decisionHandler(.allow)
        }
    }
}
