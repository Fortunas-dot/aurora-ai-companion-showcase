import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import connectDB from '../config/database';
import User from '../models/User';
import Post from '../models/Post';
import Group from '../models/Group';
import Comment from '../models/Comment';
import JournalEntry from '../models/JournalEntry';
import Message from '../models/Message';
import Notification from '../models/Notification';

dotenv.config();

const sampleUsers = [
  {
    email: 'sarah@test.com',
    password: process.env.SEED_PASSWORD || 'change-me-locally',
    username: 'sarah_wellness',
    displayName: 'Sarah',
    bio: 'Mental health advocate | Yoga enthusiast | Always here to listen 💙',
    isAnonymous: false,
    healthInfo: {
      mentalHealth: [
        { condition: 'anxiety', severity: 'moderate' },
        { condition: 'depression', severity: 'mild' },
      ],
      therapies: ['cbt', 'meditation'],
    },
  },
  {
    email: 'mike@test.com',
    password: process.env.SEED_PASSWORD || 'change-me-locally',
    username: 'mike_mindful',
    displayName: 'Mike',
    bio: 'Sharing my journey with depression. You are not alone! 🌟',
    isAnonymous: false,
    healthInfo: {
      mentalHealth: [
        { condition: 'depression', severity: 'moderate' },
      ],
      medications: ['sertraline'],
    },
  },
  {
    email: 'lisa@test.com',
    password: process.env.SEED_PASSWORD || 'change-me-locally',
    username: 'lisa_healing',
    displayName: 'Lisa',
    bio: 'Therapist in training | Mental health warrior | Spreading positivity ✨',
    isAnonymous: false,
    isTherapist: true,
    healthInfo: {
      mentalHealth: [
        { condition: 'anxiety', severity: 'mild' },
        { condition: 'ptsd', severity: 'moderate' },
      ],
      therapies: ['therapy', 'mindfulness'],
    },
  },
  {
    email: 'david@test.com',
    password: process.env.SEED_PASSWORD || 'change-me-locally',
    username: 'david_strong',
    displayName: 'David',
    bio: 'Recovering from burnout | Learning to prioritize self-care 🧘',
    isAnonymous: false,
    healthInfo: {
      mentalHealth: [
        { condition: 'burnout', severity: 'severe' },
        { condition: 'anxiety', severity: 'moderate' },
      ],
      physicalHealth: [
        { condition: 'chronic fatigue', severity: 'moderate' },
      ],
    },
  },
  {
    email: 'emma@test.com',
    password: process.env.SEED_PASSWORD || 'change-me-locally',
    username: 'emma_hopeful',
    displayName: 'Emma',
    bio: 'Bipolar disorder warrior | Art therapy lover | Living my best life 🎨',
    isAnonymous: false,
    healthInfo: {
      mentalHealth: [
        { condition: 'bipolar', severity: 'moderate' },
      ],
      medications: ['lithium'],
      therapies: ['art therapy'],
    },
  },
  {
    email: 'james@test.com',
    password: process.env.SEED_PASSWORD || 'change-me-locally',
    username: 'james_calm',
    displayName: 'James',
    bio: 'ADHD & anxiety | Productivity tips | Coffee enthusiast ☕',
    isAnonymous: false,
    healthInfo: {
      mentalHealth: [
        { condition: 'adhd', severity: 'moderate' },
        { condition: 'anxiety', severity: 'mild' },
      ],
      medications: ['adderall'],
    },
  },
  {
    email: 'sophia@test.com',
    password: process.env.SEED_PASSWORD || 'change-me-locally',
    username: 'sophia_zen',
    displayName: 'Sophia',
    bio: 'Mindfulness teacher | Meditation guide | Peace seeker 🧘‍♀️',
    isAnonymous: false,
    healthInfo: {
      mentalHealth: [
        { condition: 'anxiety', severity: 'mild' },
      ],
      therapies: ['meditation', 'yoga'],
    },
  },
  {
    email: 'alex@test.com',
    password: process.env.SEED_PASSWORD || 'change-me-locally',
    username: 'alex_recovery',
    displayName: 'Alex',
    bio: 'Eating disorder recovery | Body positivity | Self-love journey 💪',
    isAnonymous: false,
    healthInfo: {
      mentalHealth: [
        { condition: 'eating disorder', severity: 'moderate' },
      ],
      therapies: ['cbt', 'nutrition counseling'],
    },
  },
];

const sampleGroups = [
  {
    name: 'Depression Support',
    description: 'A safe and supportive community for people dealing with depression. Share your experiences, tips, and support each other through difficult times. Together we can overcome challenges and find hope.',
    tags: ['depression', 'support', 'mental-health'],
    isPrivate: false,
    avatar: null,
    coverImage: 'gradient:blue',
    country: 'global',
    healthCondition: 'Depression',
  },
  {
    name: 'Anxiety & Panic',
    description: 'For everyone struggling with anxiety and panic attacks. Find understanding, coping strategies, and a community that knows what you\'re going through. Together we are stronger.',
    tags: ['anxiety', 'panic', 'support'],
    isPrivate: false,
    avatar: null,
    coverImage: 'gradient:teal',
    country: 'global',
    healthCondition: 'Anxiety Disorder',
  },
  {
    name: 'Self-Care & Mindfulness',
    description: 'Tips, tricks, and inspiration for self-care and mindfulness practices. Learn to take time for yourself, practice meditation, and discover new ways to nurture your mental wellbeing.',
    tags: ['self-care', 'mindfulness', 'wellness'],
    isPrivate: false,
    avatar: null,
    coverImage: 'gradient:green',
    country: 'global',
    healthCondition: null,
  },
  {
    name: 'Bipolar Support',
    description: 'A supportive community for people with bipolar disorder. Share experiences, medication insights, and support each other through the ups and downs. You are not alone in this journey.',
    tags: ['bipolar', 'support', 'mental-health'],
    isPrivate: true,
    avatar: null,
    coverImage: 'gradient:purple',
    country: 'global',
    healthCondition: 'Borderline',
  },
  {
    name: 'ADHD Community',
    description: 'For people with ADHD and neurodivergent individuals. Share tips, strategies, productivity hacks, and understanding from like-minded people. Celebrate your unique strengths!',
    tags: ['adhd', 'neurodiversity', 'support'],
    isPrivate: false,
    avatar: null,
    coverImage: 'gradient:orange',
    country: 'global',
    healthCondition: 'ADHD',
  },
  {
    name: 'Trauma Healing',
    description: 'A safe and confidential space for trauma healing and recovery. Access professional guidance, peer support, and resources to help you on your healing journey. Your story matters.',
    tags: ['trauma', 'healing', 'ptsd'],
    isPrivate: true,
    avatar: null,
    coverImage: 'gradient:blue',
    country: 'global',
    healthCondition: 'PTSD',
  },
  {
    name: 'Autism Support Network',
    description: 'A welcoming community for individuals on the autism spectrum and their allies. Share experiences, celebrate neurodiversity, and find understanding in a judgment-free space.',
    tags: ['autism', 'neurodiversity', 'support'],
    isPrivate: false,
    avatar: null,
    coverImage: 'gradient:purple',
    country: 'global',
    healthCondition: 'Autism',
  },
  {
    name: 'Eating Disorder Recovery',
    description: 'A compassionate community for those in recovery from eating disorders. Share your journey, find support, and celebrate every step forward. Recovery is possible and you deserve support.',
    tags: ['eating-disorder', 'recovery', 'support'],
    isPrivate: true,
    avatar: null,
    coverImage: 'gradient:pink',
    country: 'global',
    healthCondition: 'Eating Disorder',
  },
  {
    name: 'Netherlands Mental Health',
    description: 'A Dutch-speaking community for mental health support in the Netherlands. Connect with others, share resources, and find local support. Samen staan we sterker.',
    tags: ['netherlands', 'dutch', 'mental-health'],
    isPrivate: false,
    avatar: null,
    coverImage: 'gradient:orange',
    country: 'NL',
    healthCondition: null,
  },
  {
    name: 'PTSD Warriors',
    description: 'A community for those living with PTSD. Share coping strategies, find understanding, and support each other on the path to healing. Your strength inspires others.',
    tags: ['ptsd', 'trauma', 'healing'],
    isPrivate: false,
    avatar: null,
    coverImage: 'gradient:teal',
    country: 'global',
    healthCondition: 'ptsd',
  },
  {
    name: 'Setting Personal Boundaries',
    description: 'A supportive space for learning to set and hold healthy boundaries — at work, with family, in relationships, and with yourself. Share the scripts that work, celebrate the small wins, and vent about the hard days. "No" is a complete sentence, and you are allowed to take up space.',
    tags: ['boundaries', 'self-care', 'assertiveness', 'relationships'],
    isPrivate: false,
    // Calm, non-person landscape (a quiet forest path) used as the group's picture —
    // set on both avatar (list thumbnail) and coverImage (group hero).
    avatar: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=400&q=80',
    coverImage: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80',
    country: 'global',
    healthCondition: null,
  },
];

const samplePosts = [
  {
    title: 'Small Steps Forward',
    content: 'Today was a difficult day, but I\'m proud of myself for getting through it. Small steps are still steps forward! 💪',
    postType: 'post' as const,
    tags: ['depression', 'self-care', 'motivation'],
  },
  {
    title: 'How do you manage panic attacks when they happen in public?',
    content: `I've been struggling with panic attacks for about a year now, and while I've gotten better at managing them at home, I'm really struggling when they happen in public places. Last week I had one at the grocery store and I had to leave my cart and go sit in my car for 20 minutes before I could drive home. It was so embarrassing and scary.

The physical symptoms are the worst part for me - my heart races, I feel like I can't breathe, my hands shake, and I get dizzy. I know logically that I'm not having a heart attack, but in the moment it feels so real and terrifying. I've tried breathing exercises, but when I'm panicking, it's hard to remember to do them or to do them correctly.

I'm looking for practical strategies that work in the moment when you're in a public place. What do you do when you feel a panic attack coming on? Are there specific techniques that help you ground yourself quickly? How do you handle the embarrassment of having to leave or step away from a situation?

I'm also curious about prevention - are there things you do regularly that help reduce the frequency of panic attacks? I've noticed mine seem to be triggered by crowds, feeling trapped, or when I'm already stressed about other things. Any advice would be so appreciated. Thank you for reading.`,
    postType: 'question' as const,
    tags: ['anxiety', 'panic', 'question', 'coping-strategies', 'public-places'],
  },
  {
    title: 'My Depression Journey: Finding Light in the Darkness',
    content: `Three years ago, I found myself in a place I never thought I'd be. The world that once felt vibrant and full of possibilities had suddenly become gray, muted, and suffocating. I didn't recognize it at first—I thought I was just tired, maybe going through a rough patch. But the days turned into weeks, and the weeks into months, and I realized something was deeply wrong.

Getting out of bed became a monumental task. The simplest activities—showering, eating, even talking to friends—felt like climbing a mountain. I would lie in bed for hours, staring at the ceiling, feeling nothing and everything all at once. The weight on my chest was constant, making every breath feel like a struggle.

I remember the day I finally admitted I needed help. I was sitting in my car in a grocery store parking lot, unable to go inside. The thought of navigating the bright lights, the people, the decisions about what to buy—it all felt impossible. That's when I called my doctor.

Therapy wasn't a magic cure, but it was a start. My therapist helped me understand that depression wasn't a character flaw or a weakness—it was an illness, and like any illness, it could be treated. We worked through cognitive behavioral therapy, and slowly, I began to see patterns in my thinking that were keeping me stuck.

Medication was another piece of the puzzle. It took time to find the right one, and there were side effects and adjustments, but eventually, I found something that helped lift the fog just enough for me to start doing the work.

The journey wasn't linear. There were setbacks, days when I felt like I was back at square one. But I learned to celebrate small victories: getting out of bed before noon, making myself a meal, reaching out to a friend. These weren't small things—they were everything.

Today, I'm in a much better place. I still have difficult days, but I have tools now. I know how to recognize the warning signs, I have a support system, and most importantly, I know that I'm not alone. If you're reading this and you're in that dark place, please know that there is hope. Reach out. Ask for help. Your story isn't over yet. 🌟`,
    postType: 'story' as const,
    tags: ['depression', 'story', 'hope', 'recovery', 'therapy'],
  },
  {
    title: 'What mindfulness or meditation practices have actually helped you with anxiety and depression?',
    content: `I've been dealing with anxiety and depression for a while now, and my therapist keeps recommending mindfulness and meditation. I've tried a few apps and YouTube videos, but I'm struggling to stick with it and I'm not sure if it's really helping. I know it's supposed to be good for mental health, but I find it hard to quiet my mind - my thoughts just race even more when I try to sit still and focus.

I'm wondering what specific practices have actually worked for people here. Are there particular types of meditation that are better for anxiety? What about for depression when you feel too low to even want to try? How long did it take before you noticed any benefits?

I'm also curious about practical questions: How long do you meditate for? Do you do it at a specific time of day? What do you do when your mind wanders (which mine does constantly)? Are there any guided meditations or teachers you'd recommend?

I really want to give this a fair shot, but I'm feeling discouraged. I'd love to hear from people who have actually found mindfulness helpful, especially if you also struggled with it at first. What made it click for you? What would you tell someone who's just starting out?`,
    postType: 'question' as const,
    tags: ['mindfulness', 'meditation', 'anxiety', 'depression', 'self-care', 'question'],
  },
  {
    title: 'A Good Day',
    content: 'Today I had a good day for the first time in weeks. I feel hopeful. 🌈',
    postType: 'post' as const,
    tags: ['hope', 'positive', 'progress'],
  },
  {
    title: 'How do you handle social anxiety at work or in professional settings?',
    content: `I've been dealing with social anxiety for years, but it's become a real problem at my new job. I work in an office where there are a lot of team meetings, presentations, and networking events. Every time I have to speak up in a meeting, my heart starts racing, my voice shakes, and I feel like everyone can see how anxious I am. I've started avoiding speaking up even when I have good ideas, which is affecting my career.

The worst part is the anticipatory anxiety - I'll spend days worrying about an upcoming presentation or meeting. I can't sleep the night before, and I feel sick to my stomach. Afterward, I replay everything I said in my head, convinced I made a fool of myself (even though logically I know I probably didn't).

I'm looking for practical advice from people who've dealt with this. How do you manage the physical symptoms when you have to speak in meetings? Are there preparation strategies that help? How do you handle the self-criticism afterward?

I'm also wondering about disclosure - has anyone told their boss or HR about their social anxiety? I'm worried about stigma, but I'm also worried that if I don't say something, my performance will suffer. I'm in therapy and working on this, but I need strategies that work in the moment at work.

Any advice would be so helpful. Thank you.`,
    postType: 'question' as const,
    tags: ['anxiety', 'social-anxiety', 'work', 'professional', 'question', 'coping'],
  },
  {
    title: 'Embracing My ADHD: A Journey of Self-Acceptance',
    content: `Growing up, I always felt like I was running on a different operating system than everyone else. While my classmates could sit still and focus for hours, my mind was like a browser with 50 tabs open, each one playing a different video. I was labeled as "lazy," "disruptive," and "not living up to my potential." The truth was, I was trying harder than anyone knew.

I wasn't diagnosed until I was 25. By then, I had developed a lifetime of coping mechanisms, most of them unhealthy. I thought my inability to focus, my impulsivity, my emotional dysregulation—these were all personal failures. I spent years feeling broken, like there was something fundamentally wrong with me that I just needed to "fix."

The diagnosis was both a relief and a grief. Relief because finally, there was a name for what I was experiencing. Grief because I thought about all those years I spent hating myself, thinking I was just not trying hard enough.

Learning about ADHD changed everything. I discovered that my brain isn't broken—it's different. The same traits that made school difficult—hyperfocus, creativity, thinking outside the box—are also my greatest strengths. When I'm passionate about something, I can dive deeper than anyone. My mind makes connections others don't see. I see patterns and possibilities that linear thinkers miss.

Medication helped, but it wasn't the whole answer. I had to learn to work with my brain instead of against it. I use timers, break tasks into tiny pieces, and embrace my need for movement. I've learned that fidgeting isn't a distraction—it's how I think. I've accepted that I'll never be the person who remembers appointments without a calendar, and that's okay.

The hardest part was unlearning the shame. Years of being told I wasn't trying hard enough, that I was "too much" or "not enough," had left deep scars. But I'm learning to see my neurodivergence as a superpower, not a disability. My ADHD brain has given me resilience, creativity, and a unique perspective on the world.

To anyone else navigating this journey: you're not broken. Your brain works differently, and that's not a flaw—it's a feature. Neurodiversity is a strength. We need different kinds of minds to solve the world's problems. Your way of thinking is valuable, even if the world hasn't always made space for it. 🧠✨`,
    postType: 'story' as const,
    tags: ['adhd', 'neurodiversity', 'acceptance', 'self-love', 'mental-health'],
  },
  {
    title: 'Self-Care Tip of the Day',
    content: 'Self-care tip of the day: take a warm bath, put on your favorite music and read a good book. You deserve it! 🛁📚',
    postType: 'post' as const,
    tags: ['self-care', 'tip', 'wellness'],
  },
  {
    title: 'What was your experience starting anxiety medication? I\'m scared but considering it.',
    content: `I've been struggling with severe anxiety for about two years now. I've been in therapy and tried various coping strategies, but my anxiety is still significantly impacting my daily life. My therapist and doctor have both suggested that medication might help, but I'm really scared to try it.

I have a lot of concerns: What if the side effects are worse than my anxiety? What if I become dependent on it? What if it changes my personality? I've heard horror stories about people feeling like zombies or having terrible withdrawal symptoms. But I've also heard that medication can be life-changing for some people.

I'm wondering if people could share their honest experiences - both positive and negative. What medication did you try? How long did it take to work? What side effects did you experience, and did they go away? How did you know it was working?

I'm also curious about the process: How did you decide it was time to try medication? Did you try therapy first? How do you work with your doctor to find the right medication and dosage? What questions should I ask my doctor?

I know medication isn't a magic cure, and I plan to continue therapy. But I'm at a point where I feel like I need more help. I'd really appreciate hearing from people who've been through this decision. Thank you for sharing.`,
    postType: 'question' as const,
    tags: ['anxiety', 'medication', 'treatment', 'side-effects', 'question', 'therapy'],
  },
  {
    title: 'Setting Boundaries',
    content: 'Today I was proud of myself for saying "no" to something that was giving me too much stress. Setting boundaries is important! 💪',
    postType: 'post' as const,
    tags: ['boundaries', 'self-care', 'assertiveness'],
    groupIndex: 10, // Setting Personal Boundaries
  },
  {
    title: 'Recovery from an Eating Disorder: Reclaiming My Relationship with Food',
    groupIndex: 7, // Eating Disorder Recovery (pinned so the new group at index 10 doesn't capture it)
    content: `My eating disorder didn't start with a diet. It started with a comment, a comparison, a moment of feeling like I wasn't enough. What began as "just being healthy" slowly became an obsession that consumed every waking moment of my life.

At first, it felt like control. In a world that felt chaotic and uncertain, controlling what I ate gave me a sense of power. I counted every calorie, weighed myself multiple times a day, and exercised compulsively. But the control I thought I had was actually controlling me.

Food became the enemy. Every meal was a battle, every bite a calculation. I would spend hours planning what I would eat, then feel overwhelming guilt and shame when I deviated from my plan. Social events became nightmares because they involved food. I started isolating myself, canceling plans, avoiding situations where I might have to eat in front of others.

My body was breaking down. I was cold all the time, my hair was falling out, and I was constantly exhausted. But the voice in my head told me I wasn't sick enough, that I needed to lose more weight, that I was still too much. The scale became my judge, jury, and executioner.

The turning point came when I collapsed at work. My body had simply had enough. In the hospital, a kind nurse looked at me and said, "You don't have to live like this." Something in me broke open. I was so tired of fighting, of calculating, of hating myself.

Recovery was the hardest thing I've ever done. It meant facing the feelings I had been numbing with restriction. It meant learning to eat again, to trust my body, to challenge the voice that told me I wasn't worthy. It meant gaining weight, which felt terrifying, but it also meant gaining my life back.

Therapy helped me understand that my eating disorder wasn't about food—it was about control, about perfectionism, about trying to be enough in a world that constantly told me I wasn't. I had to learn to sit with discomfort, to feel my feelings instead of numbing them, to be kind to myself.

Nutritional counseling taught me that food is fuel, not the enemy. I learned to eat intuitively, to listen to my body's signals, to honor my hunger and my fullness. It took time, but slowly, meals became less about control and more about nourishment.

Today, I'm in recovery. Not "recovered" in the sense that it's behind me forever—I still have difficult days, still have to be mindful of my thoughts and behaviors. But I'm living. I'm eating meals with friends, trying new foods, and most importantly, I'm learning to see my body as my home, not my enemy.

If you're struggling with an eating disorder, please know that recovery is possible. It's hard, and it's messy, and it's not linear. But you deserve to be free from this. You deserve to eat without fear, to live without constant calculation, to exist in your body without hating it. Help is available. You are not alone. ❤️`,
    postType: 'story' as const,
    tags: ['eating-disorder', 'recovery', 'hope', 'body-image', 'healing'],
  },
  {
    title: 'How do you manage chronic stress and prevent burnout?',
    content: `I feel like I'm constantly stressed and on the verge of burnout. I work a demanding job, have family responsibilities, and I'm also dealing with some personal health issues. Every day feels like I'm running on empty, and I'm starting to notice it's affecting my mental and physical health - I'm having trouble sleeping, I'm irritable, and I feel like I can't enjoy anything anymore.

I know I need to make changes, but I don't know where to start. I feel guilty taking time for myself because there's always so much to do. When I do try to relax, I can't turn my brain off - I'm constantly thinking about what I should be doing or worrying about what might go wrong.

I'm looking for practical strategies from people who've been in similar situations. What helped you when you were feeling overwhelmed? How do you prioritize self-care when you feel like you don't have time? Are there specific techniques for managing stress in the moment when you can't take a break?

I'm also curious about boundaries - how do you say no to additional responsibilities when you're already overwhelmed? I struggle with this because I don't want to let people down, but I know I'm spreading myself too thin.

I'm starting to realize that I can't keep going like this, but I don't know how to change. Any advice or strategies that have worked for you would be so appreciated. Thank you.`,
    postType: 'question' as const,
    tags: ['stress', 'burnout', 'self-care', 'boundaries', 'coping', 'question'],
  },
  {
    title: 'How do you know when it\'s time to seek professional help for mental health?',
    content: `I've been struggling with my mental health for a while now, but I'm not sure if it's "bad enough" to warrant seeing a therapist or psychiatrist. I keep telling myself that other people have it worse, that I should be able to handle this on my own, that I'm just being dramatic. But I'm also not functioning well - I'm having trouble at work, my relationships are suffering, and I feel miserable most of the time.

I've been dealing with what I think might be depression and anxiety for about 6 months. I have trouble sleeping, I've lost interest in things I used to enjoy, I feel anxious and worried all the time, and I'm having trouble concentrating. Some days I can barely get out of bed. But then I think - maybe this is just a rough patch? Maybe I should just try harder?

I'm wondering how other people knew it was time to seek help. What were the signs for you? Did you also struggle with feeling like you weren't "sick enough"? How did you overcome that barrier?

I'm also curious about the practical side - how did you find a therapist? What was the process like? How long did it take before you started feeling better? I'm worried about the cost and time commitment, but I'm also worried about continuing to feel this way.

Any guidance would be really helpful. I feel stuck and don't know what to do.`,
    postType: 'question' as const,
    tags: ['therapy', 'help-seeking', 'mental-health', 'depression', 'anxiety', 'question'],
  },
  {
    title: 'How do you support a loved one with mental health struggles without burning out?',
    content: `My partner has been dealing with severe depression for the past year. I love them deeply and want to be supportive, but I'm really struggling. I feel like I'm walking on eggshells all the time, trying to say the right thing, trying to help, but nothing I do seems to make a difference. They're in therapy and on medication, but progress is slow, and some days are really hard.

I'm exhausted. I feel like I'm carrying the weight of both of our mental health, and I don't know how much longer I can do it. I feel guilty for feeling this way - they're the one who's suffering, not me. But I'm also struggling with my own anxiety and stress from trying to support them.

I'm looking for advice from people who've been in similar situations. How do you balance being supportive with protecting your own mental health? What boundaries have you had to set? How do you deal with the guilt of needing to take care of yourself?

I also want to know what actually helps. What can I do or say that's actually supportive? What should I avoid? I feel like I'm constantly second-guessing myself, worried I'm going to say the wrong thing and make things worse.

I don't want to give up on them, but I also can't keep going like this. How do you maintain a relationship when one person is struggling with severe mental health issues? Is there hope for things to get better?`,
    postType: 'question' as const,
    tags: ['relationships', 'support', 'caregiver', 'depression', 'boundaries', 'question'],
  },
  {
    title: 'What helps with insomnia related to anxiety and depression?',
    content: `I've been struggling with insomnia for months now, and it's making everything worse. I lie in bed for hours, my mind racing with anxious thoughts and worries. When I do finally fall asleep, I wake up multiple times during the night, and I'm exhausted when my alarm goes off. The lack of sleep is making my anxiety and depression worse, which makes it even harder to sleep - it's a vicious cycle.

I've tried all the basic sleep hygiene stuff - no screens before bed, regular sleep schedule, avoiding caffeine, etc. But my mind just won't shut off. I'll be exhausted, but as soon as I lie down, my brain starts going through everything I'm worried about, everything I need to do, everything that could go wrong.

I'm wondering what has actually worked for people who've dealt with this. Are there specific techniques for quieting an anxious mind at bedtime? Has medication helped? What about therapy - did addressing the underlying anxiety help with sleep?

I'm also curious about the short-term - what do you do when you're lying in bed at 2am and can't sleep? Do you get up? Stay in bed? I've heard conflicting advice about this.

I'm desperate for better sleep. It feels like everything would be more manageable if I could just get some rest. Any advice would be so appreciated.`,
    postType: 'question' as const,
    tags: ['insomnia', 'sleep', 'anxiety', 'depression', 'question', 'coping'],
  },
  {
    title: 'Overcoming Social Anxiety: From Isolation to Connection',
    content: `For as long as I can remember, social situations felt like walking through a minefield. Every conversation was a potential disaster. What if I said something stupid? What if they could see how anxious I was? What if I had nothing interesting to contribute? These thoughts would race through my mind, making even simple interactions feel overwhelming.

I became a master at avoidance. I'd decline invitations, make excuses, find reasons to stay home. I convinced myself I was an introvert, that I just preferred being alone. But the truth was, I was lonely. I wanted connection, I wanted friends, I wanted to feel like I belonged somewhere. The fear was just too strong.

The panic attacks started in college. I'd be in a group setting, and suddenly my heart would race, my palms would sweat, and I'd feel like I couldn't breathe. I'd have to leave, find a bathroom, lock myself in a stall until the wave of terror passed. I thought I was going crazy.

It took me years to realize that what I was experiencing had a name: social anxiety disorder. Knowing it was a real condition, not just me being "weird" or "shy," was validating. But it also meant I had to face it.

Therapy was terrifying at first. Talking to a stranger about my deepest fears? But my therapist was patient and kind. We started small—exposure therapy, challenging my catastrophic thinking, learning coping strategies. I practiced breathing exercises, learned to recognize when my thoughts were spiraling, and gradually started putting myself in situations that scared me.

The first time I went to a party and stayed the whole time, I cried in my car afterward. Not from sadness, but from relief. I had done it. I had survived. And slowly, it got easier. Not easy—I still get anxious, I still have moments where I want to run. But I've learned that I can do hard things, that the fear doesn't have to control me.

I've made friends now. Real friends, people who know about my anxiety and accept me anyway. I've learned that most people are too busy worrying about themselves to judge me as harshly as I judge myself. I've discovered that vulnerability is actually a strength—when I'm honest about my struggles, people often open up about their own.

Social anxiety still visits me sometimes, but it's no longer the boss of my life. I go to events, I speak up in meetings, I make small talk with strangers. Some days are harder than others, and that's okay. Progress isn't linear. But I'm living now, not just surviving. And that's everything.`,
    postType: 'story' as const,
    tags: ['anxiety', 'social-anxiety', 'recovery', 'therapy', 'courage'],
  },
  {
    title: 'Living with Bipolar Disorder: Finding Balance in the Extremes',
    content: `My life has always felt like a roller coaster, but I didn't know why. There were periods where I felt invincible—I'd stay up for days, start multiple projects, feel like I could conquer the world. Then, without warning, I'd crash. The world would become gray, everything would feel impossible, and I'd struggle to get out of bed for weeks.

I thought this was just how life was. I thought everyone experienced these extreme highs and lows. It wasn't until my early thirties, after a particularly severe manic episode that led to hospitalization, that I received a diagnosis: bipolar disorder type II.

The diagnosis explained so much. The periods of intense creativity and energy weren't just "good moods"—they were hypomanic episodes. The crushing depressions weren't just "bad days"—they were part of a cycle I couldn't control. Understanding this was both a relief and a challenge.

Medication became essential. Finding the right combination took time—there were side effects, adjustments, periods where I felt like a zombie. But eventually, we found something that helped stabilize my moods without completely flattening me. I still feel things deeply, but now within a more manageable range.

Therapy taught me to recognize the warning signs. When I'm starting to go up, I notice: decreased need for sleep, racing thoughts, increased impulsivity. When I'm starting to go down, I notice: loss of interest, fatigue, hopeless thoughts. Recognizing these patterns early helps me take action before things spiral.

I've had to make lifestyle changes. Regular sleep is non-negotiable—disrupted sleep can trigger episodes. I've learned to manage stress, to say no when I need to, to prioritize my mental health. I've built routines that keep me grounded: morning meditation, regular exercise, consistent meal times.

The hardest part has been dealing with the stigma. People don't understand bipolar disorder. They think it means I'm "crazy" or unpredictable. But I'm not—I'm managing a chronic condition, just like someone with diabetes manages their blood sugar. I'm not my diagnosis; it's just one part of who I am.

I've learned to embrace both sides of myself. The hypomanic episodes, when managed, can be periods of incredible productivity and creativity. The depressive episodes, while painful, have given me deep empathy and understanding. I've learned to find balance, to ride the waves instead of fighting them.

Living with bipolar disorder isn't easy, but it's my reality. And I'm learning to make peace with it, to work with it instead of against it. I'm learning that stability doesn't mean boring—it means having the foundation to build a life I want to live.`,
    postType: 'story' as const,
    tags: ['bipolar', 'mental-health', 'recovery', 'stigma', 'resilience'],
  },
  {
    title: 'Healing from Trauma: A Journey of Reclaiming My Life',
    content: `Trauma doesn't always look like what you see in movies. It's not always a single, dramatic event. Sometimes it's a series of smaller hurts that accumulate over time, building into something that feels insurmountable. That's what happened to me.

I spent years not understanding why I reacted the way I did to certain situations. Why I'd freeze when someone raised their voice. Why I'd dissociate during conflict. Why I couldn't trust people, even when they showed me kindness. I thought there was something fundamentally broken about me.

It wasn't until I started therapy that I began to connect the dots. The childhood experiences I had minimized, the relationships I had normalized—these were traumas. They had shaped how my nervous system responded to the world, leaving me in a constant state of hypervigilance or shutdown.

The body keeps the score, as they say. My trauma lived in my body. The tension in my shoulders, the way I'd startle at sudden sounds, the difficulty I had feeling safe even in my own home—these were all my body's way of trying to protect me, even when the danger was long past.

Healing has been the hardest work of my life. It's meant revisiting painful memories, feeling feelings I had numbed for years, learning to sit with discomfort instead of running from it. It's meant learning that I'm safe now, that the danger is over, even when my body doesn't believe it yet.

EMDR therapy was a game-changer for me. It helped me process traumatic memories in a way that didn't retraumatize me. I learned that I could remember without reliving, that I could acknowledge what happened without being consumed by it.

Somatic therapy taught me to listen to my body, to understand its signals, to help it feel safe again. I learned breathing techniques, grounding exercises, ways to regulate my nervous system when it goes into fight-or-flight mode.

Building safety has been crucial. I've learned to set boundaries, to recognize red flags, to trust my instincts. I've surrounded myself with people who respect my boundaries, who understand that "no" is a complete sentence, who don't push when I need space.

The journey isn't over. I still have triggers, still have days when the past feels present. But I'm learning that healing isn't about erasing what happened—it's about integrating it, learning from it, and moving forward with wisdom and strength.

I'm learning to trust again, slowly. I'm learning that not everyone will hurt me, that I can be vulnerable and safe at the same time. I'm learning that my trauma responses were survival strategies, and I can honor them while also learning new ways of being in the world.

If you're on a similar journey, please know that healing is possible. It's not linear, and it's not easy, but it's worth it. You deserve to feel safe. You deserve to reclaim your life. Your trauma doesn't define you—it's just one part of your story, and you get to write the rest.`,
    postType: 'story' as const,
    tags: ['trauma', 'ptsd', 'healing', 'therapy', 'resilience', 'recovery'],
  },
  {
    title: 'Navigating Life with OCD: Beyond the Stereotypes',
    content: `When people think of OCD, they often picture someone who's overly organized, who likes things clean, who's a "perfectionist." But that's not what my OCD looks like. My OCD is intrusive thoughts that won't stop, compulsions I can't resist, and a constant feeling that something terrible will happen if I don't do things exactly right.

It started subtly. I'd have a thought—"What if I left the stove on?"—and even though I knew I had checked it, I'd have to go back and check again. And again. And again. The thought wouldn't leave until I had "proven" to myself that everything was safe. But the relief was temporary. The thought would come back, and the cycle would repeat.

The thoughts got darker. "What if I hurt someone?" "What if I'm a bad person?" "What if something terrible happens to my family?" These weren't desires—they were fears. But my brain couldn't tell the difference. I'd spend hours trying to prove to myself that I wasn't a monster, that I wouldn't do these things, that I was safe.

The compulsions took over my life. I'd wash my hands until they bled. I'd check locks dozens of times. I'd avoid certain numbers, certain words, certain situations that triggered my anxiety. I'd arrange things in specific ways, repeat actions until they felt "right," count things obsessively.

I thought I was going crazy. I thought I was the only person in the world who had these thoughts, who did these things. The shame was overwhelming. I hid it from everyone, even my family. I became a master at disguising my compulsions, at explaining away my behaviors.

It wasn't until I stumbled upon information about OCD online that I realized what I was experiencing had a name. Reading about intrusive thoughts, about how common they are, about how they don't reflect who you are—it was like a weight lifted. I wasn't crazy. I wasn't a bad person. I had a treatable condition.

Exposure and Response Prevention (ERP) therapy changed my life. It was terrifying at first—the idea of facing my fears, of not performing my compulsions, felt impossible. But my therapist guided me through it, starting small and building up. I learned that the anxiety would pass, that I could tolerate discomfort, that the thoughts were just thoughts, not predictions or commands.

Medication helped too. It didn't make the thoughts go away completely, but it made them quieter, less urgent, easier to ignore. Combined with therapy, it gave me the space to do the work of recovery.

Recovery from OCD isn't about making the thoughts stop—it's about learning to live with them, to not let them control you. I still have intrusive thoughts sometimes. But now I can recognize them for what they are: just thoughts, not reality. I can let them pass without engaging with them, without performing compulsions to make them go away.

I've learned that my brain is just trying to protect me, in its own misguided way. The intrusive thoughts, the compulsions—they're my brain's attempt to control uncertainty, to prevent harm. But I don't need to control everything. I can live with uncertainty. I can trust that I'm safe, even when my brain tells me I'm not.

If you're struggling with OCD, please know that you're not alone, and you're not your thoughts. Help is available. Recovery is possible. You don't have to live in fear. You can learn to live with uncertainty, to tolerate discomfort, to break free from the cycle of obsessions and compulsions.`,
    postType: 'story' as const,
    tags: ['ocd', 'anxiety', 'mental-health', 'therapy', 'recovery', 'hope'],
  },
  {
    title: 'My anxiety gets loud at night when it is quiet. What helps?',
    content:
      'During the day I can usually cope, but at night when things get quiet my brain starts racing. I end up stuck in that "what if" loop, and my body feels tense even when I am safe. Breathing helps for a minute, then the thoughts come right back.\n\nI am looking for routines or grounding strategies that help you switch from "on" to "sleep." What do you do to wind down (music, journaling, a routine, grounding, anything)? And what do you do when your mind refuses to slow down?',
    postType: 'question' as const,
    tags: ['anxiety', 'sleep', 'night-routine', 'coping', 'question'],
    comments: [
      'Oof, the quiet at night spiral is so real.',
      'I relate. What is helped me is the same wind down every night, no negotiating.',
      'If breathing only works for a minute, try grounding before bed. It gives my brain a task.',
      'You are not alone. The fact you are looking for a strategy instead of blaming yourself matters.',
    ],
  },
  {
    title: 'Therapy homework week. I did the boring stuff and honestly… I am proud',
    content:
      'This week was not dramatic. It was just real. I did the little homework my therapist asked for, even when I did not feel like it.\n\nOne check in, one journaling prompt, and one moment where I caught my brain doing the worst case story and I interrupted it. Nothing magically fixed my life overnight, but I feel steadier.\n\nIf you are waiting for motivation to show up first, this is your reminder that showing up small still counts.',
    postType: 'post' as const,
    tags: ['therapy', 'self-care', 'progress', 'habits'],
    comments: [
      'This is the kind of progress I wish more people talked about.',
      'Small homework wins are huge, especially when you are tired.',
      'I love that you caught the worst case story and interrupted it. That is real work.',
      'Proud of you. Keep doing the boring things.',
    ],
  },
  {
    title: 'The guilt that hits when I finally rest. How do you handle it?',
    content:
      'Does anyone else get guilt when they finally stop and rest? For me it is like, "If I am not being productive, I am falling behind." Even when I am exhausted, I feel restless like I should be doing chores, replying, catching up.\n\nI know rest is important, but the guilt feels louder than the logic. What helped you reframe it? Any practical scripts or boundaries you use so you can actually relax without spiraling?',
    postType: 'question' as const,
    tags: ['burnout', 'guilt', 'boundaries', 'self-care', 'question'],
    groupIndex: 10, // Setting Personal Boundaries
    comments: [
      'Yes. My brain treats rest like it is optional, and that is exhausting.',
      'A script helps me too. I literally say to myself, "I am allowed to stop now."',
      'Try a tiny next step instead of trying to relax instantly. It eases the guilt.',
      'Rest is not something you earn. Your nervous system needs it.',
    ],
  },
  {
    title: 'I set a boundary with my family and nothing exploded (small win)',
    content:
      'I used to dread certain family conversations because they always turned into pressure. I would go in stressed, and I would leave even more stressed.\n\nThis time I tried something small. I gave myself a time limit and used a simple script. When it started drifting into that zone, I said calmly I was not available right now, and I ended the call.\n\nI expected to feel awful, but honestly I felt lighter. Not perfect, not forever fixed, but my nervous system finally got a break.',
    postType: 'story' as const,
    tags: ['boundaries', 'family', 'stress', 'healing', 'support'],
    groupIndex: 10, // Setting Personal Boundaries
    comments: [
      'That is a big win. Boundaries are hard when people keep pushing.',
      'I am proud of you for using a script instead of arguing.',
      'Ending the call is underrated. Your peace matters more than being understood in that moment.',
      'Small wins like this change the pattern over time.',
    ],
  },
  {
    title: 'ADHD mornings. How do you start without burning out?',
    content:
      'Mornings are hard. I wake up and everything feels urgent, but I cannot decide what matters first. Then I either do nothing, or I do one thing and crash.\n\nJust be motivated advice does not work when my brain is overloaded.\n\nWhat helps you actually start? Do you use timers, body doubling, a tiny checklist, or prep the night before? What does your first 20 to 30 minutes look like on a tough day?',
    postType: 'question' as const,
    tags: ['adhd', 'routine', 'morning', 'productivity', 'question'],
    comments: [
      'I need a super short plan or I freeze.',
      'Timers plus body doubling help me start without burning out.',
      'Prep the night before is my cheat code. Even one tiny step helps.',
      'Thank you for asking. I am saving this for the next rough morning.',
    ],
  },
];

// New recent posts (older batch dated late March 2025; newer batch dated late June / early July 2026)
// authorIndex maps to sampleUsers: 0=Sarah, 1=Mike, 2=Lisa(therapist), 3=David, 4=Emma, 5=James, 6=Sophia, 7=Alex
// groupIndex maps to sampleGroups: 0=Depression, 1=Anxiety, 2=Self-Care, 3=Bipolar, 4=ADHD, 5=Trauma, 6=Autism, 7=Eating Disorder, 8=NL Mental Health, 9=PTSD Warriors, 10=Setting Personal Boundaries
const recentPosts = [
  {
    title: 'I finally told someone how I really feel',
    content: 'I have been carrying this weight for months, pretending everything is fine when it is not. Today at lunch my coworker asked how I was doing and instead of saying "good" I said "honestly, not great." She just listened. No advice, no judgment, just listened.\n\nI cried in the bathroom after, but not because I was sad. I think I was relieved. I did not realize how exhausting it is to fake being okay every single day.\n\nIf you are holding everything in because you think nobody wants to hear it, maybe try telling one person. It does not fix things, but the weight gets a tiny bit lighter.',
    postType: 'post' as const,
    tags: ['vulnerability', 'support', 'depression', 'honesty'],
    authorIndex: 1, // Mike
    groupIndex: 0, // Depression Support
    createdAt: new Date('2025-03-31T14:22:00'),
    comments: [
      { text: 'This hit me hard. I do the same thing every day. Maybe I will try being honest with someone this week.', authorIndex: 0 }, // Sarah
      { text: 'The fact that she just listened without trying to fix it is everything. That is what real support looks like.', authorIndex: 6 }, // Sophia
      { text: 'I am proud of you for being vulnerable. That takes real courage, especially when you have been masking for a long time.', authorIndex: 4 }, // Emma
      { text: 'Being heard without judgment can be deeply healing. What you experienced is called co-regulation — when another person\'s calm presence helps your nervous system settle. It is a reminder that we are not meant to carry everything alone. Keep letting people in, even in small ways.', authorIndex: 2, isTherapistComment: true }, // Lisa (therapist)
    ],
  },
  {
    title: 'Does anyone else feel worse after scrolling social media?',
    content: 'I know this is not a new topic but I need to talk about it. Every time I open Instagram I end up comparing my life to everyone else and feeling like I am falling behind. People my age are getting promoted, traveling, getting married, and I am just trying to get through the day without a panic attack.\n\nI deleted the app twice but I always re-download it because I feel disconnected without it. It is like I know it is bad for me but I cannot stop.\n\nHow do you manage this? Has anyone found a healthy balance or did you just quit entirely?',
    postType: 'question' as const,
    tags: ['social-media', 'comparison', 'anxiety', 'self-worth', 'question'],
    authorIndex: 0, // Sarah
    groupIndex: 1, // Anxiety & Panic
    createdAt: new Date('2025-03-31T10:05:00'),
    comments: [
      { text: 'I set a 20 minute daily limit on Instagram and it honestly changed my mental health. The first week was hard but now I do not even miss it.', authorIndex: 5 }, // James
      { text: 'I unfollowed everyone who made me feel bad about myself and only follow accounts about nature and dogs now. My feed is completely different.', authorIndex: 7 }, // Alex
      { text: 'The comparison trap is real. I had to remind myself that people only post their highlights. Nobody is posting their panic attacks or crying in the car.', authorIndex: 4 }, // Emma
      { text: 'I quit Instagram for 3 months and genuinely felt better. When I came back I was way more intentional about who I follow.', authorIndex: 3 }, // David
    ],
  },
  {
    title: 'Small win: I cooked a real meal today',
    content: 'When my depression is bad I survive on cereal and toast. Today I actually made pasta with vegetables and sat down at the table to eat it instead of eating over the sink.\n\nIt sounds so small but if you know what depression meals look like you understand. I even did the dishes after.\n\nCounting this as a victory.',
    postType: 'post' as const,
    tags: ['depression', 'small-wins', 'self-care', 'progress'],
    authorIndex: 4, // Emma
    groupIndex: 0, // Depression Support
    createdAt: new Date('2025-03-31T18:30:00'),
    comments: [
      { text: 'This IS a victory. When I was at my worst, making food felt impossible. Proud of you.', authorIndex: 1 }, // Mike
      { text: 'And you did the dishes? That is two wins. Give yourself credit.', authorIndex: 0 }, // Sarah
      { text: 'I know exactly what you mean. The sink meals. The standing-in-the-kitchen-eating-crackers meals. Making real food and sitting down is huge.', authorIndex: 3 }, // David
    ],
  },
  {
    title: 'Medication update: 3 months on sertraline',
    content: 'I wanted to share an honest update because when I was considering medication I could not find enough real experiences.\n\nWeek 1-2: Nausea, headaches, felt worse than before. Almost quit.\nWeek 3-4: Side effects faded. Started sleeping better. Still anxious but the edge was softer.\nMonth 2: First time in years I woke up without dread. Cried happy tears.\nMonth 3 (now): I still have bad days but the baseline is so much higher. I can function. I can enjoy things again.\n\nMedication is not for everyone and it is not a magic pill. But for me it gave me enough stability to actually use the coping skills I learned in therapy. If you are on the fence, talk to your doctor. There is no shame in needing help.',
    postType: 'story' as const,
    tags: ['medication', 'sertraline', 'anxiety', 'depression', 'honest-review'],
    authorIndex: 1, // Mike
    groupIndex: 0, // Depression Support
    createdAt: new Date('2025-03-30T16:45:00'),
    comments: [
      { text: 'Thank you for being so honest about the timeline. I am on week 2 and feeling awful. This gives me hope to push through.', authorIndex: 0 }, // Sarah
      { text: 'The "woke up without dread" part made me tear up. I want that so badly.', authorIndex: 7 }, // Alex
      { text: 'Similar experience here with a different SSRI. The first two weeks are genuinely rough but it does get better.', authorIndex: 5 }, // James
      { text: 'Thank you for sharing this so openly. What you described — medication lowering the floor so therapy skills can actually land — is exactly how it is designed to work. The courage it takes to stay with it through those early weeks is something many people underestimate. Keep checking in with your prescriber and be honest about what you notice.', authorIndex: 2, isTherapistComment: true }, // Lisa (therapist)
      { text: 'I was so scared to start but reading posts like this helped me make the decision. Been on it for 6 weeks now and finally starting to feel the shift.', authorIndex: 6 }, // Sophia
    ],
  },
  {
    title: 'How do you explain depression to someone who has never had it?',
    content: 'My partner is incredibly supportive but he genuinely does not understand what depression feels like. He says things like "just try to think positive" or "go for a walk, you will feel better" and I know he means well but it makes me feel so misunderstood.\n\nI have tried explaining it but I cannot find the right words. It is not sadness. It is not laziness. It is like trying to run through water while everyone else is running on land.\n\nHow have you explained it to people who have never experienced it? Are there analogies or resources that helped your loved ones understand?',
    postType: 'question' as const,
    tags: ['depression', 'relationships', 'communication', 'question', 'understanding'],
    authorIndex: 0, // Sarah
    groupIndex: 0, // Depression Support
    createdAt: new Date('2025-03-30T11:20:00'),
    comments: [
      { text: 'I told my wife it is like your phone being on 2 percent battery all day no matter how much you charge it. She finally got it after that.', authorIndex: 3 }, // David
      { text: 'I sent my boyfriend the "black dog" video on YouTube by the WHO. It explains it visually and he understood so much more after watching it.', authorIndex: 4 }, // Emma
      { text: 'The running through water analogy is actually really good. I might use that myself.', authorIndex: 6 }, // Sophia
      { text: 'Sometimes people cannot fully understand things they have not lived. But they can learn to believe you when you say it is real. That matters more than perfect understanding.', authorIndex: 2, isTherapistComment: true }, // Lisa (therapist)
    ],
  },
  {
    title: 'I went to a coffee shop alone and did not panic',
    content: 'This probably sounds ridiculous to most people but for someone with social anxiety this is massive. I walked in, ordered, sat down with my book, and stayed for an hour. My heart was beating fast at first but I kept breathing and it passed.\n\nSix months ago I could not even make a phone call without rehearsing it five times. Exposure therapy is working. Slowly, painfully, but it is working.\n\nTo anyone starting exposure therapy and thinking it is pointless: keep going. It gets easier.',
    postType: 'post' as const,
    tags: ['social-anxiety', 'exposure-therapy', 'progress', 'anxiety', 'celebration'],
    authorIndex: 6, // Sophia
    groupIndex: 1, // Anxiety & Panic
    createdAt: new Date('2025-03-30T19:10:00'),
    comments: [
      { text: 'Not ridiculous at all. I remember the first time I ate alone in public. It felt like climbing a mountain. Well done.', authorIndex: 0 }, // Sarah
      { text: 'The phone call rehearsal thing is SO relatable. I still do that sometimes.', authorIndex: 5 }, // James
      { text: 'Exposure therapy changed my life too. The key is doing it consistently even when every part of you wants to avoid.', authorIndex: 7 }, // Alex
    ],
  },
  {
    title: 'Today I journaled for the first time in years',
    content: 'My therapist has been suggesting journaling for months and I kept brushing it off because it felt pointless. What is writing going to do?\n\nBut last night I could not sleep and I just started writing. Not structured, not pretty, just whatever came out. I filled three pages and when I was done I actually felt calmer. Like the thoughts had somewhere to go instead of looping in my head.\n\nI am not saying journaling is a cure but I understand now why people recommend it. Sometimes you just need to get the noise out of your head and onto paper.',
    postType: 'post' as const,
    tags: ['journaling', 'therapy', 'coping', 'sleep', 'self-discovery'],
    authorIndex: 3, // David
    groupIndex: 2, // Self-Care & Mindfulness
    createdAt: new Date('2025-03-29T21:40:00'),
    comments: [
      { text: 'The "thoughts had somewhere to go" part perfectly describes why journaling works for me. Your brain stops recycling them.', authorIndex: 6 }, // Sophia
      { text: 'I do this every night before bed now. Even 5 minutes makes a difference.', authorIndex: 0 }, // Sarah
      { text: 'What you discovered on your own is something called externalization — moving internal experiences outside of yourself so you can observe them instead of being consumed by them. It is one of the simplest and most powerful tools available. Keep writing, even when it feels messy.', authorIndex: 2, isTherapistComment: true }, // Lisa (therapist)
      { text: 'I tried structured journals and hated them. Free writing like you describe is way more natural for me.', authorIndex: 1 }, // Mike
    ],
  },
  {
    title: 'The loneliness of depression nobody talks about',
    content: 'Everyone talks about the sadness part of depression but nobody talks about the loneliness. Not the "I have no friends" kind but the "I am surrounded by people and still feel completely alone" kind.\n\nI went to dinner with friends on Saturday. They were laughing and having a great time and I was sitting there feeling like I was watching them through glass. Present but not connected. There but not really there.\n\nI smiled and nodded and said the right things but inside I felt nothing. And then I went home and cried because I wanted so badly to feel what they were feeling.\n\nDoes anyone else experience this? How do you bridge that gap?',
    postType: 'question' as const,
    tags: ['depression', 'loneliness', 'disconnection', 'question', 'emotional-numbness'],
    authorIndex: 7, // Alex
    groupIndex: 0, // Depression Support
    createdAt: new Date('2025-03-29T13:15:00'),
    comments: [
      { text: 'The glass metaphor is exactly it. You described something I could never put into words. You are not alone in feeling alone.', authorIndex: 1 }, // Mike
      { text: 'I experience this constantly. The worst part is feeling guilty for not being present when your friends are right there.', authorIndex: 4 }, // Emma
      { text: 'For me the bridge started with being honest with one friend about it. She said "you do not have to pretend with me" and it cracked something open.', authorIndex: 0 }, // Sarah
      { text: 'This is called emotional numbness or depersonalization and it is more common than people realize. It does not mean you are broken. It is your brain protecting you when it is overwhelmed.', authorIndex: 2, isTherapistComment: true }, // Lisa (therapist)
      { text: 'I force myself to tell at least one person at the table something real. Even a small "I am having a rough day." It breaks the glass a little.', authorIndex: 3 }, // David
    ],
  },
  {
    title: 'ADHD tax: what is the most expensive thing your ADHD has cost you?',
    content: 'I will start. I forgot to cancel a free trial and got charged 6 months of a service I never used. Before that I paid a late fee on rent because I forgot to set up auto-pay even though I had the money.\n\nThe ADHD tax is real and nobody warns you about it. Expired groceries, duplicate purchases because you forgot you already bought it, impulse spending when your brain needs dopamine.\n\nWhat is your worst ADHD tax moment? And more importantly, what systems have you set up to prevent it?',
    postType: 'question' as const,
    tags: ['adhd', 'adhd-tax', 'money', 'executive-function', 'question'],
    authorIndex: 5, // James
    groupIndex: 4, // ADHD Community
    createdAt: new Date('2025-03-29T10:30:00'),
    comments: [
      { text: 'Parking tickets. So many parking tickets. I set a timer now every single time I park. Non-negotiable.', authorIndex: 3 }, // David
      { text: 'I bought the same book three times because I kept forgetting I already owned it. Now I have a shared note with my partner of everything I buy.', authorIndex: 4 }, // Emma
      { text: 'Auto-pay everything. Seriously everything. It was the single best decision I made for my ADHD brain.', authorIndex: 0 }, // Sarah
      { text: 'Expired food in the fridge is my biggest one. I started putting masking tape with the date I opened things and it actually helps.', authorIndex: 7 }, // Alex
    ],
  },
  {
    title: 'I stopped saying sorry for existing',
    content: 'I caught myself apologizing to someone for asking a question at work today and I stopped mid-sentence. Why am I sorry for needing information to do my job?\n\nI have been apologizing my whole life. Sorry for taking up space. Sorry for having needs. Sorry for being too much or not enough. My therapist pointed out that I say sorry an average of 12 times per session.\n\nSo I am practicing. Replacing "sorry for venting" with "thank you for listening." Replacing "sorry I am late" with "thank you for waiting." It feels awkward but I am done apologizing for existing.\n\nAnyone else working on this?',
    postType: 'post' as const,
    tags: ['self-worth', 'boundaries', 'anxiety', 'growth', 'therapy'],
    authorIndex: 0, // Sarah
    groupIndex: 10, // Setting Personal Boundaries
    createdAt: new Date('2025-03-31T08:15:00'),
    comments: [
      { text: 'The "thank you for listening" instead of "sorry for venting" reframe is something I am going to start using immediately.', authorIndex: 5 }, // James
      { text: '12 times per session. That hit me because I would probably be the same. We are so conditioned to shrink ourselves.', authorIndex: 4 }, // Emma
      { text: 'I started this last year and people actually respond better to thank you than sorry. It changes the whole energy of the conversation.', authorIndex: 6 }, // Sophia
    ],
  },
  {
    title: 'Night anxiety check-in: who else is awake right now?',
    content: 'It is almost midnight and my brain decided now is the perfect time to replay every awkward thing I have ever said. Cannot sleep. Heart is racing. Already tried breathing exercises and they helped for about 5 minutes.\n\nJust wanted to post here because sometimes it helps to know other people are awake and fighting the same battle. If you are reading this at 2am, you are not alone.\n\nWhat is keeping you up tonight?',
    postType: 'post' as const,
    tags: ['anxiety', 'insomnia', 'night', 'support', 'community'],
    authorIndex: 5, // James
    groupIndex: 1, // Anxiety & Panic
    createdAt: new Date('2025-03-29T23:48:00'),
    comments: [
      { text: 'Right here with you. 1am and my brain is doing the highlight reel of embarrassing moments from 2019.', authorIndex: 1 }, // Mike
      { text: 'The replay at night is the worst. I started keeping a notepad by my bed to write down the thoughts so my brain stops looping them.', authorIndex: 6 }, // Sophia
      { text: 'You are not alone. I am up too. Sending you calm energy from across the internet.', authorIndex: 7 }, // Alex
      { text: 'Try the 5-4-3-2-1 grounding technique if breathing is not enough. Name 5 things you can see, 4 you can touch, etc. It gives your brain a different task.', authorIndex: 0 }, // Sarah
    ],
  },

  // ===== Newer batch (late June / early July 2026) — keeps the feed feeling active =====
  // Authored entirely by the existing sample users (indices 0-7); therapist Lisa (2) only comments.
  {
    title: 'ERP homework: I touched the door handle and did NOT wash my hands',
    content: 'For anyone who does not have OCD this sounds like nothing. For me it was a mountain.\n\nMy ERP homework this week was to touch the door handle at the clinic and then sit with the anxiety without washing my hands or using sanitizer. My therapist stayed with me. My brain was SCREAMING that I was going to make someone sick, that I was contaminated, that something terrible would happen.\n\nI sat with it. The anxiety peaked at about a 9, then slowly, over maybe 20 minutes, it came down on its own. Nothing bad happened. Nobody got sick.\n\nI know I will have to do it again and again for it to stick, but today I proved to myself that the fear lies. The discomfort is temporary and I can survive it.',
    postType: 'story' as const,
    tags: ['ocd', 'erp', 'exposure-therapy', 'anxiety', 'recovery'],
    authorIndex: 0, // Sarah
    groupIndex: 1, // Anxiety & Panic
    createdAt: new Date('2026-07-02T15:40:00'),
    comments: [
      { text: 'This is HUGE. People really do not get how loud the OCD brain is in those moments. Proud of you for sitting with it.', authorIndex: 5 }, // James
      { text: 'The fear lies. I need that tattooed on my arm. Well done.', authorIndex: 3 }, // David
      { text: 'What you described — anxiety peaking and then falling on its own without the compulsion — is exactly the learning ERP is built on. Your brain just collected real evidence that it can tolerate uncertainty. Every rep makes the next one a little easier. This is excellent work.', authorIndex: 2, isTherapistComment: true }, // Lisa (therapist)
      { text: 'I am starting ERP next month and I am terrified. Reading this makes it feel possible. Thank you for sharing.', authorIndex: 6 }, // Sophia
    ],
  },
  {
    title: 'Nobody warned me postpartum anxiety could look like this',
    content: 'Everyone talks about postpartum depression but not enough people talk about postpartum anxiety.\n\nMy baby is healthy and I love her more than anything, but my brain will not stop showing me horrible intrusive thoughts about all the ways she could get hurt. I check if she is breathing constantly. I cannot sleep even when she sleeps because I am on high alert. I googled a rash for two hours at 3am.\n\nI finally told my midwife and she said this is really common and treatable, and I actually cried with relief because I thought I was going crazy or a bad mother.\n\nIf you are a new parent stuck in the what-if spiral, please talk to someone. You are not a bad parent. Your brain is just stuck in overdrive.',
    postType: 'post' as const,
    tags: ['postpartum', 'anxiety', 'intrusive-thoughts', 'motherhood', 'support'],
    authorIndex: 6, // Sophia
    groupIndex: 1, // Anxiety & Panic
    createdAt: new Date('2026-07-01T09:12:00'),
    comments: [
      { text: 'Thank you for saying this out loud. I had the exact same checking-if-she-is-breathing thing and felt so alone in it. It does get better with support.', authorIndex: 0 }, // Sarah
      { text: 'You are already a good mother — a bad one would not be this worried about doing right by her. Be gentle with yourself.', authorIndex: 4 }, // Emma
      { text: 'Intrusive thoughts are so common in the postpartum period and they are the opposite of your intentions — they tend to latch onto what we love most. Telling your midwife was exactly the right move. Please keep leaning on your care team; you deserve support too, not just the baby.', authorIndex: 2, isTherapistComment: true }, // Lisa (therapist)
      { text: 'The 3am googling a rash for two hours is so specific and so real. Sending you rest and calm.', authorIndex: 7 }, // Alex
    ],
  },
  {
    title: 'First week at my summer job and the lunch room already makes me want to quit',
    content: 'It is not the work. The work is fine. It is the lunch room.\n\nEveryone already has their groups and I stand there with my sad little lunch not knowing where to sit or if I am allowed to join anyone. So I have been eating in a toilet stall for three days like some kind of movie cliche. My social anxiety turns a 10 minute break into the most stressful part of my day.\n\nHow do you handle communal spaces when your brain is convinced everyone is judging you? Any scripts for just... sitting down near people without it being weird?',
    postType: 'question' as const,
    tags: ['social-anxiety', 'work', 'question', 'anxiety', 'coping'],
    authorIndex: 5, // James
    groupIndex: 1, // Anxiety & Panic
    createdAt: new Date('2026-06-30T12:05:00'),
    comments: [
      { text: 'The bathroom stall lunch. I did this for an entire semester once. You are so not alone. What helped me was finding one slightly-less-scary person and asking them a low-stakes question.', authorIndex: 6 }, // Sophia
      { text: 'A script that worked for me: "Mind if I join you?" and then you do not even have to talk much, just being there counts as exposure. Most people are relieved someone made the first move.', authorIndex: 0 }, // Sarah
      { text: 'Honestly bring headphones and a book the first few times so you have something to do with your hands and eyes. Sit in the room even if you do not talk. Presence first, conversation later.', authorIndex: 3 }, // David
      { text: 'Remember the spotlight effect — we massively overestimate how much others notice or judge us, because they are busy worrying about themselves. Start with the smallest possible step: same room, same table, one sentence. You are already being brave by naming it.', authorIndex: 2, isTherapistComment: true }, // Lisa (therapist)
    ],
  },
  {
    title: 'Masking all day left me nonverbal by the evening. Learning to unmask a little.',
    content: 'I am autistic and I have gotten really good at masking — eye contact, small talk, pretending the fluorescent lights and the open office noise do not physically hurt. Too good, maybe.\n\nBy the time I get home I have nothing left. Some evenings I literally cannot speak, I just point and grunt and my partner has learned to read it. People at work think I am fine because they only see the performance, not the crash that costs me every single night.\n\nI am starting to unmask in small safe ways — wearing my loop earplugs openly, stimming at my desk, telling one trusted coworker I need quiet after meetings. It is terrifying but the exhaustion was not sustainable.\n\nFellow autistic folks: how did you start unmasking without it blowing up your whole life?',
    postType: 'post' as const,
    tags: ['autism', 'masking', 'neurodiversity', 'burnout', 'self-advocacy'],
    authorIndex: 1, // Mike
    groupIndex: 6, // Autism Support Network
    createdAt: new Date('2026-06-29T18:50:00'),
    comments: [
      { text: 'The evening nonverbal crash is something neurotypical people just do not see or believe. The loop earplugs openly thing was my first step too. Solidarity.', authorIndex: 4 }, // Emma
      { text: 'I started by telling exactly one person, same as you. It slowly gave me permission to take up space. Small safe experiments, not a big announcement.', authorIndex: 3 }, // David
      { text: 'Stimming at your desk is not something to apologize for — it is regulation. You are allowed to meet your own needs. Proud of you for choosing sustainability over performance.', authorIndex: 6 }, // Sophia
    ],
  },
  {
    title: 'A code at work triggered a flashback mid-shift. Here is how I got through it.',
    content: 'I am an ICU nurse with PTSD, mostly from a stretch during the pandemic I do not talk about much. Yesterday we ran a code and something about the sounds and the adrenaline dropped me straight into a flashback. For a few seconds I was not on that unit, I was two years in the past.\n\nWhat helped, in case it helps someone else:\n- I pressed my back flat against the wall to feel something solid and present\n- I named the date and the room number out loud in my head\n- I ran cold water over my wrists in the med room afterward\n- I told my charge nurse I needed five minutes, and for once I actually took them\n\nI finished my shift. I am shaky today but I am okay. Healing is not linear and helpers are allowed to need help too.',
    postType: 'story' as const,
    tags: ['ptsd', 'flashback', 'grounding', 'healthcare', 'trauma'],
    authorIndex: 1, // Mike
    groupIndex: 9, // PTSD Warriors
    createdAt: new Date('2026-06-28T20:30:00'),
    comments: [
      { text: 'Naming the date and room out loud is such a solid grounding tool. Thank you for sharing your actual in-the-moment steps, not just theory.', authorIndex: 3 }, // David
      { text: 'As someone who also freezes when the past crashes into the present — the cold water on the wrists trick is real. Sending you a gentle day today.', authorIndex: 0 }, // Sarah
      { text: 'The fact that you asked for five minutes and took them is enormous, especially in a caregiving role where we are trained to override our own needs. Sensory grounding like cold water and pressure against the wall works because it signals safety to the nervous system faster than words can. You handled that with real skill.', authorIndex: 2, isTherapistComment: true }, // Lisa (therapist)
      { text: 'Helpers are allowed to need help too. Reading that just made me exhale. Thank you.', authorIndex: 7 }, // Alex
    ],
  },
  {
    title: 'I quit the job that was slowly killing me. Six weeks later, an honest update.',
    content: 'Six weeks ago I walked away from a startup job I had poured four years and most of my health into. 60+ hour weeks, Slack at midnight, the whole badge-of-honor grind. My body finally staged a coup: heart palpitations, no appetite, and a panic attack in a parking garage that I first thought was a heart attack.\n\nHonest update because the internet loves the clean quit-your-job story and hides the messy middle:\n- Week 1-2: I did not know how to relax. I felt guilty resting. I kept reaching for a laptop that was not there.\n- Week 3-4: I slept for what felt like the first time in years. Also panicked about money and identity constantly.\n- Week 5-6: Starting to feel like a person. Cooking. Walking. Reading for fun. Still scared, but my hands stopped shaking.\n\nBurnout is not a productivity problem you can hustle your way out of. It is your nervous system sending an invoice. I am finally paying it.',
    postType: 'story' as const,
    tags: ['burnout', 'work', 'recovery', 'boundaries', 'anxiety'],
    authorIndex: 3, // David
    groupIndex: 2, // Self-Care & Mindfulness
    createdAt: new Date('2026-06-27T11:00:00'),
    comments: [
      { text: 'Burnout is your nervous system sending an invoice. I am screenshotting that. This whole post is the honest version I needed to read.', authorIndex: 1 }, // Mike
      { text: 'The panic-attack-that-feels-like-a-heart-attack in a parking garage. Almost word for word my rock bottom. Glad your hands stopped shaking. It really does come back.', authorIndex: 5 }, // James
      { text: 'Thank you for showing the messy middle instead of the highlight reel. The guilt around resting is often the last symptom to heal. Be patient with the part of you that still reaches for the laptop — it kept you safe for a long time, and it will learn there is a new way.', authorIndex: 2, isTherapistComment: true }, // Lisa (therapist)
      { text: 'Relearning rest is a whole skill nobody teaches us. Rooting for you David.', authorIndex: 6 }, // Sophia
    ],
  },
  {
    title: 'Grief brain is real. I put my car keys in the fridge again.',
    content: 'My dad died four months ago and nobody warned me that grief would make me so... foggy. I forget words mid-sentence. I walked into a room three times today and forgot why. I found my keys in the fridge this morning next to the milk.\n\nI keep apologizing to people for being scattered and slow. A friend gently told me that grief takes up an enormous amount of mental bandwidth, that my brain is doing heavy work under the surface even when I look like I am just standing in the kitchen crying.\n\nIf you are grieving and feel like you are losing your mind: you are not. The forgetfulness is part of it. Be as patient with yourself as you would be with a friend.',
    postType: 'post' as const,
    tags: ['grief', 'loss', 'brain-fog', 'self-compassion', 'support'],
    authorIndex: 7, // Alex
    groupIndex: 2, // Self-Care & Mindfulness
    createdAt: new Date('2026-06-26T16:20:00'),
    comments: [
      { text: 'Keys in the fridge. Oh Alex. When my mum passed I put my phone in the freezer. Grief brain is so real and so rarely talked about. Sending you so much love.', authorIndex: 4 }, // Emma
      { text: 'Four months is still so raw. There is no timeline and no right way. The forgetfulness really is your mind protecting you while it processes something huge.', authorIndex: 0 }, // Sarah
      { text: 'Grief genuinely consumes cognitive resources — memory, focus, word-finding all take a hit because so much is being processed beneath the surface. It is not a character flaw and it is not permanent. Treating yourself with the patience you would give a grieving friend is exactly the right instinct.', authorIndex: 2, isTherapistComment: true }, // Lisa (therapist)
    ],
  },
  {
    title: 'How do you tell a genuinely good mood from the start of hypomania?',
    content: 'This is the question that haunts me as someone with bipolar II.\n\nI have had a really good week. Loads of energy, ideas flowing, sleeping a bit less but feeling great, started three new projects. And normally I would just enjoy it... except this is exactly how my hypomanic episodes begin, and they have burned me before — the crash on the other side is brutal.\n\nSo now I do not know if I am allowed to just feel good, or if I need to treat this as a warning sign and rein it in. It is exhausting to be suspicious of your own happiness.\n\nFor those further along in managing bipolar: how do you tell the difference? What are the early tells that tip you off it is hypomania and not just a good stretch?',
    postType: 'question' as const,
    tags: ['bipolar', 'hypomania', 'mood-tracking', 'question', 'self-awareness'],
    authorIndex: 4, // Emma
    groupIndex: 3, // Bipolar Support
    createdAt: new Date('2026-06-25T14:15:00'),
    comments: [
      { text: 'For me the tell is sleep. A good mood, I still want my 7-8 hours. Hypomania, I feel like I do not need sleep at all and that is the red flag. I track hours every night now.', authorIndex: 7 }, // Alex
      { text: 'The other tell for me is the number of NEW projects. Enjoying life = finishing things. Hypomania = starting five things at 2am and buying domains. Being suspicious of your own happiness is the hardest part, I feel that deeply.', authorIndex: 5 }, // James
      { text: 'Mood charting has been the thing that helped me answer this. Over time you start to see your own patterns — the early signs are usually reduced sleep, rapid speech, and impulsive spending or plans. A good mood tends to be steady; hypomania tends to accelerate. Sharing your chart with your prescriber can help you catch it early without having to white-knuckle it alone.', authorIndex: 2, isTherapistComment: true }, // Lisa (therapist)
      { text: 'You ARE allowed to feel good. The goal is not to fear every good day, just to keep an eye on the accelerator. Tracking helped me trust myself again.', authorIndex: 0 }, // Sarah
    ],
  },
  {
    title: 'I painted my anxiety instead of fighting it and something shifted',
    content: 'My anxiety was too loud to journal today so I grabbed my art supplies and just painted what it felt like. No plan, no trying to make it pretty. It came out as this tangle of grey and red scribbles with a tiny bit of yellow trying to get through in the corner.\n\nWhen I stepped back and looked at it, I actually understood my own feelings better than any amount of talking about them. The anxiety was not gone but it was outside of me, on the paper, where I could see it instead of just being swallowed by it.\n\nArt therapy gets underrated. You do not have to be good at it. You just have to let it out.',
    postType: 'post' as const,
    tags: ['art-therapy', 'anxiety', 'self-expression', 'coping', 'creativity'],
    authorIndex: 4, // Emma
    groupIndex: 2, // Self-Care & Mindfulness
    createdAt: new Date('2026-06-24T17:45:00'),
    comments: [
      { text: 'The tiny bit of yellow trying to get through in the corner made me tear up. That is hope, right there on the page.', authorIndex: 0 }, // Sarah
      { text: 'I am so bad at art but you just reminded me that is not the point. Getting it OUT is the point. Trying this tonight.', authorIndex: 5 }, // James
      { text: 'Externalizing an emotion so you can look at it instead of being consumed by it is one of the most powerful things creative expression offers. You do not need talent for it to work — you proved that today. Beautiful.', authorIndex: 2, isTherapistComment: true }, // Lisa (therapist)
    ],
  },
  {
    title: 'Body doubling on a video call with a stranger got me through my ENTIRE to-do list',
    content: 'ADHD folks, if you have not tried body doubling, this is your sign.\n\nI joined one of those silent virtual coworking calls where you just turn your camera on and work alongside strangers who are also working. No talking, we just say our goal at the start and check in at the end.\n\nSomething about another human being visible in the corner of my screen tricked my brain into actually starting. I did the taxes I had been avoiding for three weeks, answered the scary email, AND cleaned my desk. Tasks that had been rotting on my list for a MONTH.\n\nI cannot explain the neuroscience of why a stranger silently doing their own laundry makes me finally do mine, but it works and I am not questioning it.',
    postType: 'post' as const,
    tags: ['adhd', 'body-doubling', 'productivity', 'executive-function', 'tips'],
    authorIndex: 5, // James
    groupIndex: 4, // ADHD Community
    createdAt: new Date('2026-06-23T13:30:00'),
    comments: [
      { text: 'Body doubling is genuinely the only thing that reliably works for my ADHD brain. The accountability of being witnessed, even silently, is magic. Glad you found it.', authorIndex: 3 }, // David
      { text: 'Wait this is a thing?? I have been doing this accidentally by facetiming my sister while we both work. Did not know it had a name. Game changer.', authorIndex: 0 }, // Sarah
      { text: 'The taxes you avoided for three weeks getting done in one session is SO ADHD. Task rotting on the list then suddenly done in a burst. Love this for you.', authorIndex: 4 }, // Emma
      { text: 'I do this with a focus timer app that pairs you with someone. Turns out my brain will do almost anything if it thinks someone might notice if I stop.', authorIndex: 6 }, // Sophia
    ],
  },
  {
    title: 'Weekends do not recharge me anymore. Is this still burnout?',
    content: 'I used to be able to reset over a weekend. Now I get to Sunday night and feel exactly as depleted as I did on Friday, sometimes worse. I sleep in, I do nothing, and I still feel like a phone stuck at 4 percent that will not charge.\n\nI am past the acute burnout phase where I was crying at my desk, but this flat, joyless, cannot-recover feeling has hung around for months. Nothing sounds fun. I go through the motions.\n\nIs this still burnout, or is it sliding into depression? How did you tell the difference, and what actually helped when rest stopped working?',
    postType: 'question' as const,
    tags: ['burnout', 'depression', 'anhedonia', 'question', 'recovery'],
    authorIndex: 3, // David
    groupIndex: 2, // Self-Care & Mindfulness
    createdAt: new Date('2026-06-22T19:00:00'),
    comments: [
      { text: 'When rest stopped fixing it for me, that was the line where it had tipped into depression. Passive rest was not enough, I needed active recovery — small things that gave me a spark, not just an absence of demands.', authorIndex: 0 }, // Sarah
      { text: 'The phone stuck at 4 percent that will not charge is the most accurate description of anhedonia I have ever read. This was my sign to actually talk to a doctor.', authorIndex: 1 }, // Mike
      { text: 'Rest recharges a tired system, but when the joy itself goes flat for weeks or months, that anhedonia is worth taking to a professional. Burnout and depression overlap heavily and can feed each other. It does not mean you failed at resting — it may just mean rest alone is not the whole treatment. Please consider checking in with your doctor.', authorIndex: 2, isTherapistComment: true }, // Lisa (therapist)
    ],
  },
  {
    title: 'I had a panic attack in public and a stranger was quietly kind to me',
    content: 'It happened on the train. Packed carriage, no air, and suddenly my chest went tight and the world started tilting. Classic panic attack, worst possible place.\n\nA woman next to me noticed. She did not make a scene. She just leaned over and said quietly, "You are okay, I get these too. Breathe out longer than you breathe in. I will count with you." And she did, until the next stop, where she helped me off onto a bench.\n\nI never got her name. But I have been carrying her kindness around all day like a warm stone in my pocket. Sometimes the world is gentler than my anxiety tells me it is.\n\nBe that person if you can. You have no idea what it means on the other side.',
    postType: 'post' as const,
    tags: ['anxiety', 'panic', 'kindness', 'community', 'hope'],
    authorIndex: 0, // Sarah
    groupIndex: 1, // Anxiety & Panic
    createdAt: new Date('2026-06-20T10:40:00'),
    comments: [
      { text: 'Breathe out longer than you breathe in — that stranger knew exactly what she was doing. Crying a little at "a warm stone in my pocket." Thank you for sharing this.', authorIndex: 6 }, // Sophia
      { text: 'This restored a bit of my faith in people today. We really can be each other\'s safe stop on the train.', authorIndex: 3 }, // David
      { text: 'A longer exhale activates the calming branch of your nervous system, so that stranger gave you genuinely sound advice on the spot. And notice: the feared catastrophe (everyone judging you) did not happen — someone met you with care instead. Worth remembering the next time anxiety predicts the worst.', authorIndex: 2, isTherapistComment: true }, // Lisa (therapist)
      { text: 'Saving this. Next time I see someone struggling I want to be her instead of pretending not to notice.', authorIndex: 5 }, // James
    ],
  },
  {
    title: 'Recovery win: I ate the birthday cake and did not compensate for it',
    content: 'It was my friend\'s birthday. There was cake. The old me would have either refused it entirely with some excuse, or eaten it and then spent the rest of the day punishing myself — skipping the next meal, over-exercising, drowning in guilt.\n\nToday I had a slice. I tasted it. I enjoyed the frosting. I laughed with my friends. And then I just... carried on with my day. No compensating. No secret bargaining with myself. No spiral.\n\nTwo years ago this would have been unimaginable. Recovery is not always the dramatic milestones. Sometimes it is a piece of cake eaten like a normal person and a quiet internal "that\'s allowed."\n\nTo anyone still in the thick of it: the food freedom is real and it is worth the fight.',
    postType: 'story' as const,
    tags: ['eating-disorder', 'recovery', 'food-freedom', 'self-love', 'progress'],
    authorIndex: 7, // Alex
    groupIndex: 7, // Eating Disorder Recovery
    createdAt: new Date('2026-06-19T21:10:00'),
    comments: [
      { text: 'Eaten like a normal person and a quiet internal "that\'s allowed." I am sobbing. This is the whole thing right here. So proud of you Alex.', authorIndex: 4 }, // Emma
      { text: 'The not-compensating part is the real win. Anyone can eat the cake. Not bargaining with yourself afterward is where recovery actually lives.', authorIndex: 0 }, // Sarah
      { text: 'Two years of hard work behind one slice of cake. The milestones that look small from the outside are often the hardest-won. This is what freedom looks like — enjoyment without punishment. Thank you for showing others it is possible.', authorIndex: 2, isTherapistComment: true }, // Lisa (therapist)
      { text: 'I am not there yet but reading this makes me believe I could be one day. Bookmarking for the hard days.', authorIndex: 6 }, // Sophia
    ],
  },
  {
    title: 'Sunday reset: 3 tiny things that keep me steady',
    content: 'Sharing my low-effort Sunday reset in case it helps someone who, like me, cannot do the aesthetic 12-step routines the internet loves.\n\n1. Open a window and make the bed. That is the whole "cleaning." Two minutes, but the room feels less like a cave.\n2. Write down three things for the week on ONE sticky note. Not a planner, not a system I will abandon by Tuesday. One note.\n3. Text one person something kind with zero agenda. It reminds me I am part of a web of people, not floating alone.\n\nThat is it. No cold plunge, no 5am, no green juice. Just three tiny anchors that keep my week from unraveling. What are your small non-negotiables?',
    postType: 'post' as const,
    tags: ['self-care', 'routine', 'mindfulness', 'wellness', 'tips'],
    authorIndex: 6, // Sophia
    groupIndex: 2, // Self-Care & Mindfulness
    createdAt: new Date('2026-06-21T11:30:00'),
    comments: [
      { text: 'The ONE sticky note instead of a planner I abandon by Tuesday. Called out and grateful. This is the sustainable version of self-care.', authorIndex: 5 }, // James
      { text: 'My non-negotiable is a 10 minute walk with no phone. That is it. Anything more and I set myself up to fail. Love that yours are this gentle.', authorIndex: 3 }, // David
      { text: 'Texting one person with zero agenda is such an underrated one. Adding it to my list. Thank you Sophia.', authorIndex: 1 }, // Mike
    ],
  },
];

const sampleComments = [
  'You are so strong! Keep going 💪',
  'I relate to this so much. Thanks for sharing.',
  'Try breathing exercises, they always help me.',
  'You are not alone. We are in this together.',
  'What beautiful progress! Proud of you 🌟',
  'Thank you for this tip, I\'m going to try it.',
  'I\'ve been through the same. If you want to talk, I\'m here to listen.',
  'What an inspiring story! This gives me hope.',
];

const sampleJournalPrompts = [
  'How are you feeling today?',
  'What are three things you are grateful for?',
  'What made you smile today?',
  'How can you take care of yourself today?',
  'What are your goals for this week?',
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Connect to database
    await connectDB();
    
    // Clear existing data (but preserve protected accounts)
    console.log('🗑️  Clearing existing data...');
    
    // Preserve protected accounts (Apple review account, etc.)
    const protectedUsers = await User.find({ isProtected: true });
    const protectedEmails = protectedUsers.map(u => u.email);
    const preservedUser = await User.findOne({ email: process.env.PRESERVE_ACCOUNT_EMAIL || '' });
    
    if (preservedUser && !preservedUser.isProtected) {
      protectedEmails.push(process.env.PRESERVE_ACCOUNT_EMAIL || '');
    }
    
    if (protectedUsers.length > 0) {
      console.log(`  ✓ Preserving ${protectedUsers.length} protected account(s):`);
      protectedUsers.forEach(user => {
        console.log(`    - ${user.email} (${user.username})`);
      });
    }
    
    if (preservedUser && !preservedUser.isProtected) {
      console.log('  ✓ Preserving user account from PRESERVE_ACCOUNT_EMAIL');
    }
    
    // Clear all data except protected accounts
    if (protectedEmails.length > 0) {
      await User.deleteMany({ email: { $nin: protectedEmails } });
    } else {
      await User.deleteMany({});
    }
    // Update all existing groups to remove avatars BEFORE deleting (in case there are groups not created via seed)
    await Group.updateMany({}, { avatar: null }); // Force all groups to have null avatar
    
    await Post.deleteMany({});
    await Group.deleteMany({});
    await Comment.deleteMany({});
    await JournalEntry.deleteMany({});
    await Message.deleteMany({});
    await Notification.deleteMany({});
    
    // Create users
    console.log('👥 Creating users...');
    const usersToInsert = [];
    for (const userData of sampleUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const { password, ...restData } = userData;
      usersToInsert.push({
        ...restData,
        password: hashedPassword,
      });
    }
    // Insert users directly to bypass pre-save hook
    const insertedUsers = await User.insertMany(usersToInsert);
    const createdUsers = insertedUsers;
    createdUsers.forEach(user => {
      console.log(`  ✓ Created user: ${user.username}`);
    });
    
    // Add preserved users to createdUsers array
    if (protectedUsers.length > 0) {
      protectedUsers.forEach(user => {
        // Ensure displayName is set (required field)
        if (!user.displayName) {
          user.displayName = user.username || user.email || 'User';
          user.save();
        }
        createdUsers.push(user as any);
        console.log(`  ✓ Preserved protected user: ${user.username || user.email}`);
      });
    }
    
    if (preservedUser && !preservedUser.isProtected) {
      // Ensure displayName is set (required field)
      if (!preservedUser.displayName) {
        preservedUser.displayName = preservedUser.username || preservedUser.email || 'User';
        await preservedUser.save();
      }
      createdUsers.push(preservedUser as any);
      console.log(`  ✓ Preserved existing user: ${preservedUser.username || preservedUser.email}`);
    }
    
    // Create groups
    console.log('👥 Creating groups...');
    const createdGroups = [];
    for (let i = 0; i < sampleGroups.length; i++) {
      const groupData = sampleGroups[i];
      const admin = createdUsers[i % createdUsers.length];
      const members = createdUsers.slice(0, Math.min(4, createdUsers.length));
      
      const group = await Group.create({
        ...groupData,
        admins: [admin._id],
        members: members.map(u => u._id),
        // Groups default to no human profile photo; a group may opt into a non-person image.
        avatar: (groupData as any).avatar ?? null,
        coverImage: groupData.coverImage || null,
        country: groupData.country || 'global',
        healthCondition: groupData.healthCondition || null,
      });
      createdGroups.push(group);
      console.log(`  ✓ Created group: ${group.name}`);
    }
    
    // Force update all groups to ensure avatar is null (safety check),
    // except groups that intentionally opted into a non-person image.
    await Group.updateMany({ name: { $ne: 'Setting Personal Boundaries' } }, { avatar: null });

    // Create posts
    console.log('📝 Creating posts...');
    const createdPosts = [];
    for (let i = 0; i < samplePosts.length; i++) {
      const postData = samplePosts[i];
      const author = createdUsers[i % createdUsers.length];
      // Honor an explicit groupIndex when provided; otherwise fall back to the post's position.
      const gi = typeof (postData as any).groupIndex === 'number' ? (postData as any).groupIndex : i;
      const group = gi < createdGroups.length ? createdGroups[gi] : null;

    const { comments: postComments, groupIndex: _giOverride, ...postDoc } = postData as any;
      const post = await Post.create({
      ...postDoc,
        author: author._id,
        groupId: group?._id,
        likes: createdUsers.slice(0, Math.floor(Math.random() * 5)).map(u => u._id),
        commentsCount: 0,
      });
      createdPosts.push(post);
      console.log(`  ✓ Created post: ${post.postType}`);
    }
    
    // Create comments
    console.log('💬 Creating comments...');
    for (let i = 0; i < createdPosts.length; i++) {
      const post = createdPosts[i];
    const postData = samplePosts[i] as any;
    const postComments = Array.isArray(postData.comments) ? postData.comments : null;

    if (Array.isArray(postComments) && postComments.length > 0) {
      for (const commentText of postComments) {
        const commentAuthor = createdUsers[Math.floor(Math.random() * createdUsers.length)];
        const comment = await Comment.create({
          post: post._id,
          author: commentAuthor._id,
          content: commentText,
          likes: [],
        });
        
        post.commentsCount += 1;
        await post.save();
        console.log(`  ✓ Created comment on post ${i + 1}`);
      }
    } else {
      const numComments = Math.floor(Math.random() * 4) + 1;
      for (let j = 0; j < numComments; j++) {
        const commentAuthor = createdUsers[Math.floor(Math.random() * createdUsers.length)];
        const comment = await Comment.create({
          post: post._id,
          author: commentAuthor._id,
          content: sampleComments[Math.floor(Math.random() * sampleComments.length)],
          likes: [],
        });
        
        post.commentsCount += 1;
        await post.save();
        console.log(`  ✓ Created comment on post ${i + 1}`);
      }
      }
    }
    
    // Create recent posts with specific dates, authors, and comments
    console.log('📝 Creating recent posts...');
    for (const rp of recentPosts) {
      const author = createdUsers[rp.authorIndex % createdUsers.length];
      const group = rp.groupIndex != null && rp.groupIndex < createdGroups.length ? createdGroups[rp.groupIndex] : null;

      const { comments: rpComments, authorIndex: _a, groupIndex: _g, createdAt: rpDate, ...rpDoc } = rp as any;
      const post = await Post.create({
        ...rpDoc,
        author: author._id,
        groupId: group?._id,
        likes: createdUsers.slice(0, Math.floor(Math.random() * 5) + 1).map(u => u._id),
        commentsCount: 0,
        createdAt: rpDate,
      });
      createdPosts.push(post);
      console.log(`  ✓ Created recent post: "${rp.title.substring(0, 40)}..." by ${author.username}`);

      if (Array.isArray(rpComments)) {
        for (let ci = 0; ci < rpComments.length; ci++) {
          const c = rpComments[ci];
          const commentAuthor = createdUsers[c.authorIndex % createdUsers.length];
          const commentDate = new Date(rpDate.getTime() + (ci + 1) * 1000 * 60 * (5 + Math.floor(Math.random() * 55)));
          await Comment.create({
            post: post._id,
            author: commentAuthor._id,
            content: c.text,
            likes: [],
            createdAt: commentDate,
          });
          post.commentsCount += 1;
        }
        await post.save();
      }
    }

    // Create follow relationships
    console.log('🔗 Creating follow relationships...');
    for (let i = 0; i < createdUsers.length; i++) {
      const user = createdUsers[i];
      const numFollowing = Math.floor(Math.random() * 3) + 1;
      const following = createdUsers
        .filter(u => u._id.toString() !== user._id.toString())
        .sort(() => Math.random() - 0.5)
        .slice(0, numFollowing);
      
      user.following = following.map(u => u._id);
      await user.save();
      console.log(`  ✓ User ${user.username} is following ${numFollowing} users`);
    }
    
    // Create journal entries
    console.log('📔 Creating journal entries...');
    for (let i = 0; i < createdUsers.length; i++) {
      const user = createdUsers[i];
      const numEntries = Math.floor(Math.random() * 5) + 2;
      
      for (let j = 0; j < numEntries; j++) {
        const daysAgo = j;
        const createdAt = new Date();
        createdAt.setDate(createdAt.getDate() - daysAgo);
        
        const entry = await JournalEntry.create({
          author: user._id,
          content: `Today I feel ${['good', 'okay', 'difficult', 'hopeful', 'anxious'][Math.floor(Math.random() * 5)]}. ${sampleJournalPrompts[Math.floor(Math.random() * sampleJournalPrompts.length)]} I am grateful for the support I receive.`,
          mood: Math.floor(Math.random() * 5) + 5,
          symptoms: [
            {
              condition: ['anxiety', 'depression', 'stress'][Math.floor(Math.random() * 3)],
              severity: ['mild', 'moderate', 'severe'][Math.floor(Math.random() * 3)] as any,
            },
          ],
          tags: ['daily', 'reflection'],
          aiInsights: {
            sentiment: ['positive', 'neutral', 'negative'][Math.floor(Math.random() * 3)] as any,
            themes: ['self-care', 'gratitude', 'challenges'],
            therapeuticFeedback: 'You are doing well by sharing your feelings. Keep reflecting.',
          },
          isPrivate: true,
          createdAt,
        });
        console.log(`  ✓ Created journal entry for ${user.username}`);
      }
    }
    
    // Create messages
    console.log('💌 Creating messages...');
    for (let i = 0; i < createdUsers.length - 1; i++) {
      const sender = createdUsers[i];
      const receiver = createdUsers[i + 1];
      
      const messages = [
        'Hey! How are you doing?',
        'Good! And you?',
        'Also good, thanks for asking 😊',
        'No problem! If you ever want to talk, I\'m here.',
      ];
      
      for (let j = 0; j < messages.length; j++) {
        const createdAt = new Date();
        createdAt.setHours(createdAt.getHours() - (messages.length - j));
        
        await Message.create({
          sender: sender._id,
          receiver: receiver._id,
          content: messages[j],
          readAt: j < messages.length - 1 ? new Date() : undefined,
          createdAt,
        });
      }
      console.log(`  ✓ Created conversation between ${sender.username} and ${receiver.username}`);
    }
    
    // Create notifications
    console.log('🔔 Creating notifications...');
    for (let i = 0; i < createdUsers.length; i++) {
      const user = createdUsers[i];
      const numNotifications = Math.floor(Math.random() * 3) + 1;
      
      for (let j = 0; j < numNotifications; j++) {
        const notifier = createdUsers[Math.floor(Math.random() * createdUsers.length)];
        if (notifier._id.toString() !== user._id.toString()) {
          await Notification.create({
            user: user._id,
            type: ['follow', 'like', 'comment'][Math.floor(Math.random() * 3)] as any,
            relatedUser: notifier._id,
            message: ['started following you', 'liked your post', 'commented on your post'][Math.floor(Math.random() * 3)],
            read: Math.random() > 0.5,
          });
        }
      }
      console.log(`  ✓ Created notifications for ${user.username}`);
    }
    
    console.log('\n✅ Database seeding completed successfully!');
    console.log(`\n📊 Summary:`);
    console.log(`   - Users: ${createdUsers.length}`);
    console.log(`   - Groups: ${createdGroups.length}`);
    console.log(`   - Posts: ${createdPosts.length}`);
    console.log(`   - Comments: ${await Comment.countDocuments()}`);
    console.log(`   - Journal Entries: ${await JournalEntry.countDocuments()}`);
    console.log(`   - Messages: ${await Message.countDocuments()}`);
    console.log(`   - Notifications: ${await Notification.countDocuments()}`);
    console.log(`\n🔑 Test accounts created:`);
    console.log(`   All passwords: password123`);
    sampleUsers.forEach(u => {
      console.log(`   - ${u.email} (${u.username})`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run seed
seedDatabase();

