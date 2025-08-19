// Script to add the two blog posts to the database
const path = require('path');

// Add the project root to the path so we can import our database
process.chdir(path.join(__dirname, '..'));

async function addBlogs() {
  try {
    // Import the database
    const { getDB } = require('../lib/database.js');
    const db = getDB();

    console.log('🚀 Adding blog posts to database...');

    // Blog 1: Online vs Offline Chess Coaching
    const blog1 = {
      title: "Online vs Offline Chess Coaching: What's Best for You?",
      content: `With the rise of digital learning platforms, chess education has undergone a transformation. While traditional, in-person chess classes have been around for decades, online chess coaching is quickly becoming a powerful alternative, especially for parents and students seeking flexibility and wider access to qualified coaches. But which mode of learning is best for you or your child? Let's explore.

The Case for Online Chess Coaching
Online chess classes offer convenience. You no longer need to factor in travel time or coordinate schedules for physical drop-offs. With just a laptop and a stable internet connection, students can join a live class from anywhere.

But convenience isn't the only advantage. Online platforms allow students to learn at their own pace. Sessions can be recorded, games can be replayed, and digital chessboards offer tools for deeper analysis. Online classes also open doors to expert coaches from across the country—or even the globe—without the limitations of geography.

In addition, many students feel more comfortable learning from their own homes. This comfort often translates into greater confidence during gameplay and more focused practice time.

The Value of Offline Chess Classes
While online learning has its perks, in-person coaching brings its own strengths. The rapport between student and coach is often more organic, and in-person classes foster peer interaction—a vital element of any learning journey.

Students can pick up non-verbal cues, observe others' gameplay firsthand, and participate in spontaneous discussions that mimic real tournament environments. Offline classes also create space for forming social bonds, which can be motivating and confidence-boosting.

How to Choose What's Right for You
There's no one-size-fits-all answer. The right format depends on the student's age, learning style, schedule, and personal preferences.

For younger children, offline classes can provide a helpful structure and support attention.
Older students with tighter schedules may prefer the flexibility of online sessions.
Students preparing for competitive tournaments might benefit from a hybrid model: online for theory, offline for practical sparring.
It also depends on parental support. In online classes, parents may need to ensure the student remains engaged and focused. In offline settings, the logistics may require more time and commitment.

What ThinQChess Offers
At ThinQChess, we understand that every learner is different. That's why we offer both formats—offline coaching at our Bangalore centres and online classes designed with interactive tools and real-time feedback.

Our goal is to ensure that whether your child is learning from home or at our academy, they receive the same level of attention, quality instruction, and opportunity to grow. With a team of passionate coaches and a carefully designed curriculum, we bring the best of both worlds to every chess learner.

Still unsure? Reach out to us for a free consultation or demo session. Let's find the best fit for your child's chess journey.`,
      excerpt: "With the rise of digital learning platforms, chess education has undergone a transformation. Discover which mode of learning is best for you or your child.",
      slug: "online-vs-offline-chess-coaching-whats-best-for-you",
      author: "ThinQ Chess",
      status: "published",
      tags: JSON.stringify(["chess coaching", "online learning", "offline classes", "chess education"]),
      featured_image: "/images/chess-coaching.jpg",
      created_at: "2025-06-05 00:00:00"
    };

    // Blog 2: Benefits of Learning Chess at a Young Age
    const blog2 = {
      title: "Benefits of Learning Chess at a Young Age: What Every Parent Should Know",
      content: `In a world where parents are constantly looking for ways to give their children a developmental edge, chess has emerged as more than just a game. It is a powerful learning tool that nurtures the brain, strengthens emotional resilience, and cultivates critical life skills from an early age.

Cognitive Superpower in a Checkered Board
Scientific studies and academic research worldwide have demonstrated that children who regularly play chess exhibit improved memory, enhanced concentration, and more refined problem-solving skills. Chess actively engages both sides of the brain, logic and creativity, and builds pathways that can enhance a child's learning capacity in other academic subjects, too.

Children who engage with chess often show improvement in subjects like mathematics and reading comprehension, thanks to the logical sequencing and pattern recognition that the game promotes. Moreover, it instils an analytical approach to problems, encouraging kids to think several steps ahead before making a move.

Improved concentration and memory
Chess demands sustained focus and deep thinking, helping players—especially children—develop sharper attention spans over time. Regular practice trains the brain to retain patterns, anticipate moves, and recall strategies, which naturally strengthens memory. These skills often carry over into academics, making it easier to concentrate in class and remember what's learned.

Chess: A Game That Builds Character
Chess is also an emotional educator. It teaches children to manage both victory and defeat with grace. The game has no room for luck; it rewards discipline, patience, and consistency. Children learn to take responsibility for their decisions, evaluate consequences, and adapt to changing circumstances —a valuable emotional toolkit that proves beneficial in both school and life.

More importantly, chess is an excellent way to help children build resilience. Losing a match isn't the end; it's an opportunity to reflect, improve, and return stronger.

Early Start, Lasting Impact
Starting young has its unique benefits. The brain is most malleable in the early years, making it easier for children to absorb new systems of thought. Many of the world's top chess players, including Grandmasters, began learning the game before the age of 10. The earlier a child starts, the more naturally the skills become part of their personality.

But it's not about raising a prodigy. Even casual learning of chess from a young age helps shape well-rounded individuals with sharper minds and calmer temperaments.

Why ThinQChess?
At ThinQChess, we believe chess is for everyone. Our courses are designed to make the game accessible, engaging, and deeply beneficial for children across age groups and skill levels. Whether it's through interactive exercises, one-on-one mentorship, or game analysis sessions, our goal is to help children build not just skills but confidence.

With experienced coaches and a curriculum built on both classical techniques and modern engagement tools, we are preparing young minds to think sharper, move smarter, and grow stronger.

Ready to give your child a lifelong advantage? Register for a trial class today.`,
      excerpt: "Chess has emerged as more than just a game. It is a powerful learning tool that nurtures the brain, strengthens emotional resilience, and cultivates critical life skills from an early age.",
      slug: "benefits-of-learning-chess-at-a-young-age-what-every-parent-should-know",
      author: "ThinQ Chess",
      status: "published",
      tags: JSON.stringify(["chess benefits", "child development", "cognitive skills", "chess education"]),
      featured_image: "/images/chess-children.jpg",
      created_at: "2025-06-01 00:00:00"
    };

    // Check if blogs already exist
    const existingBlog1 = db.prepare('SELECT id FROM blogs WHERE slug = ?').get(blog1.slug);
    const existingBlog2 = db.prepare('SELECT id FROM blogs WHERE slug = ?').get(blog2.slug);

    if (existingBlog1) {
      console.log('📝 Updating existing blog 1...');
      db.prepare(`
        UPDATE blogs 
        SET title = ?, content = ?, excerpt = ?, author = ?, status = ?, tags = ?, featured_image = ?, updated_at = CURRENT_TIMESTAMP
        WHERE slug = ?
      `).run(blog1.title, blog1.content, blog1.excerpt, blog1.author, blog1.status, blog1.tags, blog1.featured_image, blog1.slug);
    } else {
      console.log('➕ Adding new blog 1...');
      db.prepare(`
        INSERT INTO blogs (title, content, excerpt, slug, author, status, tags, featured_image, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(blog1.title, blog1.content, blog1.excerpt, blog1.slug, blog1.author, blog1.status, blog1.tags, blog1.featured_image, blog1.created_at);
    }

    if (existingBlog2) {
      console.log('📝 Updating existing blog 2...');
      db.prepare(`
        UPDATE blogs 
        SET title = ?, content = ?, excerpt = ?, author = ?, status = ?, tags = ?, featured_image = ?, updated_at = CURRENT_TIMESTAMP
        WHERE slug = ?
      `).run(blog2.title, blog2.content, blog2.excerpt, blog2.author, blog2.status, blog2.tags, blog2.featured_image, blog2.slug);
    } else {
      console.log('➕ Adding new blog 2...');
      db.prepare(`
        INSERT INTO blogs (title, content, excerpt, slug, author, status, tags, featured_image, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(blog2.title, blog2.content, blog2.excerpt, blog2.slug, blog2.author, blog2.status, blog2.tags, blog2.featured_image, blog2.created_at);
    }

    console.log('✅ Blog posts added successfully!');
    console.log('📚 Blog 1: Online vs Offline Chess Coaching');
    console.log('📚 Blog 2: Benefits of Learning Chess at a Young Age');

  } catch (error) {
    console.error('❌ Error adding blogs:', error);
  }
}

// Run the script
addBlogs();
