import SwiftUI

struct NavigationPage: Identifiable, Hashable {
    let id = UUID()
    let url: String
    let title: String
}

struct ContentView: View {
    @State private var path = NavigationPath()
    
    // Map filename to title for navigation bar display
    func getTitle(for url: String) -> String {
        if let item = navigationItems.first(where: { $0.page == url }) {
            return item.title
        }
        return "Detail"
    }

    var body: some View {
        NavigationStack(path: $path) {
            // Layer 1: Homepage (WebView with Native Hotbar Interception)
            WebView(urlString: "index.html") { destinationUrl in
                // Intercept navigation from index.html (e.g. clicking Hotbar)
                debugPrint("Navigating to: \(destinationUrl)")
                let page = NavigationPage(url: destinationUrl, title: getTitle(for: destinationUrl))
                path.append(page)
            }
            .edgesIgnoringSafeArea(.all)
            .navigationTitle("Home")
            .navigationBarHidden(true) // Hide nav bar on home like a fullscreen app
            .navigationDestination(for: NavigationPage.self) { page in
                // Layer 2: Detail Page
                WebView(urlString: page.url)
                    .navigationTitle(page.title)
                    .navigationBarTitleDisplayMode(.inline)
                    .edgesIgnoringSafeArea(.bottom)
            }
        }
        .preferredColorScheme(.dark)
    }
}
