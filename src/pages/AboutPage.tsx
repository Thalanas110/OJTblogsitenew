import BlogHeader from "@/components/BlogHeader";
import { User, Heart, Briefcase, MessageCircle } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen blog-bg">
      <div className="min-h-screen blog-bg-overlay">
        <BlogHeader />
        <main className="container mx-auto px-4 py-8 max-w-3xl">
          <article className="bg-card rounded-lg border border-border overflow-hidden">
            <div className="p-6 md:p-8">
              {/* Profile picture */}
              <div className="flex justify-center mb-6">
                <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-border">
                  <img
                    src="/images/pfp.jpg"
                    alt="Adriaan Dimate Profile Picture"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Title */}
              <h1 className="font-mono text-2xl md:text-3xl font-bold text-card-foreground text-center mb-2">
                About Me
              </h1>
              <p className="text-center text-muted-foreground font-mono text-sm mb-6 flex items-center justify-center gap-2">
                <User size={16} className="text-primary" />
                Future Airline Captain &amp; Doctor of Philosophy
              </p>

              <hr className="border-border mb-6" />

              {/* Welcome */}
              <section className="mb-8">
                <h2 className="font-mono text-lg font-bold text-card-foreground mb-3 flex items-center gap-2">
                  <Heart size={18} className="text-primary" />
                  Welcome
                </h2>
                <p className="text-sm text-card-foreground font-mono leading-relaxed">
                  Hi guys! I am Adriaan Dimate, a BSCS-SD 2nd year student at Gordon College.
                  This blogsite is a tool for sharing my experiences in CSP131 — the RLE leg
                  of Practicum 1 under the guidance of{" "}
                  <a
                    href="https://www.linkedin.com/in/loudelmanaloto/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary font-semibold hover:underline"
                  >
                    Prof. Loudel M. Manaloto, MSCS
                  </a>
                  . My Practicum 1 operations are currently (07/04/2025) being conducted at{" "}
                  <a
                    href="https://www.acebaypointe.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary font-semibold hover:underline"
                  >
                    ACEMC-Baypointe
                  </a>
                  , a hospital located at Lot 1A &amp; 1B, Dewey Avenue, Subic Bay
                  Freeport Zone, Olongapo City, Zambales.
                </p>
              </section>

              {/* My Journey */}
              <section className="mb-8">
                <h2 className="font-mono text-lg font-bold text-card-foreground mb-3 flex items-center gap-2">
                  <span className="text-primary">🩺</span>
                  My Journey
                </h2>
                <p className="text-sm text-card-foreground font-mono leading-relaxed">
                  I normally do not write blogs, but I'm fine about sharing it here mainly
                  because Sir Loudel wants to see it. Plus, it also allows me a massive
                  opportunity to gain experience so that I can set-up a tech company in the
                  future as one of my final objectives in life, while also passing a highly
                  overkill requirement for the course.
                </p>
              </section>

              {/* What I do */}
              <section className="mb-8">
                <h2 className="font-mono text-lg font-bold text-card-foreground mb-3 flex items-center gap-2">
                  <Briefcase size={18} className="text-primary" />
                  What I do in the OJT
                </h2>
                <ul className="text-sm text-card-foreground font-mono leading-relaxed space-y-1 list-disc list-inside ml-2">
                  <li>Ledger Completions</li>
                  <li>Excel Data Encoding</li>
                  <li>Data Checking, Verification, and Correction</li>
                  <li>Tax Filing and Completion</li>
                </ul>
              </section>

              {/* Let's Connect */}
              <section>
                <h2 className="font-mono text-lg font-bold text-card-foreground mb-3 flex items-center gap-2">
                  <MessageCircle size={18} className="text-primary" />
                  Let's Connect
                </h2>
                <p className="text-sm text-card-foreground font-mono leading-relaxed mb-4">
                  I believe in the power of community and shared knowledge. Feel free to leave
                  comments on my posts, share your own experiences, or reach out if you'd like
                  to discuss your OJT experiences too.
                </p>
                <p className="text-sm text-card-foreground font-mono leading-relaxed">
                  Thank you for visiting, and I hope you find something valuable here!
                </p>
              </section>
            </div>
          </article>
        </main>
      </div>
    </div>
  );
}
