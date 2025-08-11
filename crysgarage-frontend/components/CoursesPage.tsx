import { Button } from "./ui/button";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";
import { 
  Play, 
  Clock, 
  Users, 
  Star, 
  BookOpen,
  Headphones,
  Music,
  Volume2,
  Mic,
  Radio,
  ArrowRight,
  CheckCircle
} from "lucide-react";

interface CoursesPageProps {
  onGetStarted: () => void;
}

export function CoursesPage({ onGetStarted }: CoursesPageProps) {
  const courses = [
    {
      id: "mastering-fundamentals",
      title: "Audio Mastering Fundamentals",
      description: "Learn the core principles of audio mastering from EQ and compression to loudness standards.",
      instructor: "DJ Kwame",
      duration: "2.5 hours",
      lessons: 12,
      level: "Beginner",
      rating: 4.9,
      students: 2840,
      price: "Free",
      image: "🎵",
      topics: ["EQ Basics", "Compression", "Limiting", "Loudness Standards", "Frequency Analysis"],
      featured: true
    },
    {
      id: "afrobeats-mastering",
      title: "Mastering Afrobeats",
      description: "Specialized techniques for mastering Afrobeats tracks with authentic African sound characteristics.",
      instructor: "Grace Okafor",
      duration: "3 hours",
      lessons: 15,
      level: "Intermediate",
      rating: 4.8,
      students: 1960,
      price: "$29",
      image: "🥁",
      topics: ["African Rhythms", "Sub-bass Handling", "Vocal Clarity", "Traditional Instruments", "Modern Fusion"]
    },
    {
      id: "gospel-production",
      title: "Gospel Music Production & Mastering",
      description: "Complete guide to producing and mastering Gospel music with spiritual depth and technical excellence.",
      instructor: "Pastor Michael",
      duration: "4 hours",
      lessons: 20,
      level: "Intermediate",
      rating: 4.9,
      students: 1450,
      price: "$39",
      image: "🎤",
      topics: ["Choir Recording", "Organ Processing", "Vocal Harmonies", "Dynamic Worship", "Live Recording"]
    },
    {
      id: "hip-hop-mastering",
      title: "Hip-Hop Mastering Masterclass",
      description: "Master the art of Hip-Hop audio mastering with modern techniques and classic approaches.",
      instructor: "Producer Jay",
      duration: "3.5 hours",
      lessons: 18,
      level: "Advanced",
      rating: 4.7,
      students: 2240,
      price: "$49",
      image: "🎧",
      topics: ["Heavy Bass", "Vocal Presence", "Beat Dynamics", "Trap Elements", "Old School vs New"]
    },
    {
      id: "podcast-mastering",
      title: "Podcast Audio Mastering",
      description: "Professional podcast audio treatment for clear, engaging content that keeps listeners hooked.",
      instructor: "Sarah Voice",
      duration: "1.5 hours",
      lessons: 8,
      level: "Beginner",
      rating: 4.6,
      students: 1680,
      price: "$19",
      image: "🎙️",
      topics: ["Voice Clarity", "Noise Removal", "Leveling", "Intro/Outro", "Platform Optimization"]
    },
    {
      id: "advanced-techniques",
      title: "Advanced Mastering Techniques",
      description: "Professional secrets and advanced techniques used by top mastering engineers worldwide.",
      instructor: "Master Tony",
      duration: "5 hours",
      lessons: 25,
      level: "Advanced",
      rating: 4.9,
      students: 890,
      price: "$79",
      image: "⚡",
      topics: ["Multiband Processing", "Mid-Side EQ", "Harmonic Enhancement", "Reference Matching", "Mastering Chain"]
    }
  ];

  const learningPaths = [
    {
      title: "Complete Beginner",
      description: "Start from zero and build mastering skills",
      courses: ["mastering-fundamentals", "podcast-mastering"],
      duration: "4 hours",
      icon: <BookOpen className="w-6 h-6" />
    },
    {
      title: "African Music Specialist",
      description: "Master African music genres",
      courses: ["mastering-fundamentals", "afrobeats-mastering", "gospel-production"],
      duration: "9.5 hours",
      icon: <Music className="w-6 h-6" />
    },
    {
      title: "Professional Producer",
      description: "Advanced mastering for professionals",
      courses: ["hip-hop-mastering", "advanced-techniques"],
      duration: "8.5 hours",
      icon: <Volume2 className="w-6 h-6" />
    }
  ];

  const instructors = [
    {
      name: "DJ Kwame",
      title: "Senior Audio Engineer",
      bio: "15+ years mastering Afrobeats and Hip-Hop",
      image: "👨🏾‍💼",
      courses: 3,
      students: 5200
    },
    {
      name: "Grace Okafor",
      title: "Gospel Music Producer",
      bio: "Award-winning Gospel producer and engineer",
      image: "👩🏾‍💼",
      courses: 2,
      students: 3400
    },
    {
      name: "Master Tony",
      title: "Mastering Engineer",
      bio: "20+ years in professional mastering",
      image: "👨🏽‍💼",
      courses: 4,
      students: 8900
    }
  ];

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner': return 'bg-green-500/20 text-green-400';
      case 'Intermediate': return 'bg-yellow-500/20 text-yellow-400';
      case 'Advanced': return 'bg-red-500/20 text-red-400';
      default: return 'bg-crys-gold/20 text-crys-gold';
    }
  };

  return (
    <div className="min-h-screen">
              <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-16 max-w-4xl mx-auto">
          <Badge variant="secondary" className="bg-crys-gold/20 text-crys-gold mb-4">
            Learn & Master
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-crys-white mb-6">
            Audio Mastering
            <span className="block text-crys-gold">Courses & Training</span>
          </h1>
          <p className="text-xl text-crys-light-grey mb-8">
            Learn from industry professionals and master the art of audio engineering. 
            From fundamentals to advanced techniques, we've got you covered.
          </p>
          
          <div className="flex items-center justify-center gap-6 text-sm text-crys-light-grey">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-crys-gold" />
              <span>15,000+ students</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-crys-gold" />
              <span>4.8 average rating</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-crys-gold" />
              <span>Lifetime access</span>
            </div>
          </div>
        </div>

        {/* Featured Course */}
        {courses.filter(course => course.featured).map((course) => (
          <Card key={course.id} className="bg-gradient-to-r from-crys-gold/10 via-crys-gold/5 to-crys-gold/10 border-crys-gold/30 mb-16">
            <CardContent className="p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <Badge variant="secondary" className="bg-crys-gold/20 text-crys-gold mb-4">
                    🔥 Featured Course
                  </Badge>
                  <h2 className="text-3xl font-bold text-crys-white mb-4">{course.title}</h2>
                  <p className="text-crys-light-grey mb-6 leading-relaxed">{course.description}</p>
                  
                  <div className="flex items-center gap-4 mb-6 text-sm">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-crys-gold" />
                      <span className="text-crys-light-grey">{course.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4 text-crys-gold" />
                      <span className="text-crys-light-grey">{course.lessons} lessons</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-crys-gold" />
                      <span className="text-crys-light-grey">{course.students.toLocaleString()} students</span>
                    </div>
                  </div>
                  
                  <Button className="bg-crys-gold hover:bg-crys-gold-muted text-crys-black">
                    <Play className="w-4 h-4 mr-2" />
                    Start Free Course
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
                
                <div className="text-center">
                  <div className="text-8xl mb-4">{course.image}</div>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {course.topics.slice(0, 3).map((topic, index) => (
                      <Badge key={index} variant="secondary" className="bg-crys-gold/20 text-crys-gold text-xs">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Learning Paths */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-crys-white mb-4">Learning Paths</h2>
            <p className="text-crys-light-grey">Structured learning journeys for different goals</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {learningPaths.map((path, index) => (
              <Card key={index} className="bg-audio-panel-bg border-audio-panel-border hover:border-crys-gold/50 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-crys-gold/20 rounded-lg flex items-center justify-center text-crys-gold mb-4">
                    {path.icon}
                  </div>
                  <h3 className="text-crys-white font-semibold mb-2">{path.title}</h3>
                  <p className="text-crys-light-grey text-sm mb-4">{path.description}</p>
                  <div className="flex items-center gap-2 text-xs text-crys-light-grey mb-4">
                    <Clock className="w-3 h-3" />
                    <span>{path.duration} total</span>
                    <span>•</span>
                    <span>{path.courses.length} courses</span>
                  </div>
                  <Button variant="outline" size="sm" className="border-crys-gold/30 text-crys-gold hover:bg-crys-gold/10 w-full">
                    View Path
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* All Courses */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-crys-white mb-4">All Courses</h2>
            <p className="text-crys-light-grey">Choose from our comprehensive library of mastering courses</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.filter(course => !course.featured).map((course) => (
              <Card key={course.id} className="bg-audio-panel-bg border-audio-panel-border hover:border-crys-gold/50 transition-all duration-300 group">
                <CardContent className="p-6">
                  <div className="text-center mb-4">
                    <div className="text-4xl mb-2">{course.image}</div>
                    <Badge className={getLevelColor(course.level) + " text-xs"}>
                      {course.level}
                    </Badge>
                  </div>
                  
                  <h3 className="text-crys-white font-semibold mb-2 group-hover:text-crys-gold transition-colors">{course.title}</h3>
                  <p className="text-crys-light-grey text-sm mb-4 line-clamp-2">{course.description}</p>
                  
                  <div className="flex items-center justify-between text-xs text-crys-light-grey mb-4">
                    <span>{course.instructor}</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      <span>{course.rating}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-crys-light-grey mb-4">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      <span>{course.lessons} lessons</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>{course.students.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-4">
                    {course.topics.slice(0, 3).map((topic, index) => (
                      <Badge key={index} variant="secondary" className="bg-crys-gold/20 text-crys-gold text-xs">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-crys-gold font-semibold">{course.price}</span>
                    <Button size="sm" className="bg-crys-gold hover:bg-crys-gold-muted text-crys-black">
                      <Play className="w-3 h-3 mr-1" />
                      Enroll
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Instructors */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-crys-white mb-4">Meet Your Instructors</h2>
            <p className="text-crys-light-grey">Learn from industry professionals with real-world experience</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {instructors.map((instructor, index) => (
              <Card key={index} className="bg-audio-panel-bg border-audio-panel-border text-center">
                <CardContent className="p-6">
                  <div className="text-4xl mb-4">{instructor.image}</div>
                  <h3 className="text-crys-white font-semibold mb-1">{instructor.name}</h3>
                  <p className="text-crys-gold text-sm mb-2">{instructor.title}</p>
                  <p className="text-crys-light-grey text-sm mb-4">{instructor.bio}</p>
                  <div className="flex items-center justify-center gap-4 text-xs text-crys-light-grey">
                    <div>
                      <span className="text-crys-white font-medium">{instructor.courses}</span>
                      <span className="ml-1">courses</span>
                    </div>
                    <div>
                      <span className="text-crys-white font-medium">{instructor.students.toLocaleString()}</span>
                      <span className="ml-1">students</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-gradient-to-r from-crys-gold/10 via-crys-gold/5 to-crys-gold/10 rounded-2xl p-8 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-crys-white mb-4">
            Ready to Master Audio Engineering?
          </h2>
          <p className="text-crys-light-grey mb-6">
            Start with our free fundamentals course and begin your journey to professional mastering skills.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button className="bg-crys-gold hover:bg-crys-gold-muted text-crys-black">
              <Play className="w-4 h-4 mr-2" />
              Start Learning Free
            </Button>
            <Button 
              variant="outline"
              onClick={onGetStarted}
              className="border-crys-gold/30 text-crys-gold hover:bg-crys-gold/10"
            >
              Try Our Mastering App
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}