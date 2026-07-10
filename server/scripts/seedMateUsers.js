import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import User from "../models/User.js";
import MateConnection from "../models/MateConnection.js";

dotenv.config();

const getMongoUri = () =>
  process.env.MONGO_URI_LOCAL ||
  process.env.MONGO_URI;

const statuses = [
  ...Array(10).fill("mate"),
  ...Array(10).fill("request"),
  ...Array(10).fill("interest"),
];

const names = [
  ["Maya Sharma", "maya_codes", "Bonfire Vanguard", 18, 184, 260],
  ["Tara Iyer", "tara_dp", "Violet Coinmaster", 126, 412, 520],
  ["Meera Joshi", "meera_trees", "Sakura Eclipse", 318, 734, 850],
  ["Ayaan Kapoor", "ayaan_arrays", "Azure Blade", 34, 229, 310],
  ["Riya Menon", "riya_recursion", "Emerald Trailblazer", 42, 256, 340],
  ["Dev Patel", "dev_debugs", "Stormforged", 82, 388, 480],
  ["Anika Bose", "anika_binary", "Cosmic Riftwalker", 93, 421, 560],
  ["Kunal Rao", "kunal_knapsack", "Gilded Sunbearer", 111, 512, 640],
  ["Sana Khan", "sana_stack", "Crimson Ascendant", 154, 603, 710],
  ["Vihaan Das", "vihaan_graphs", "Twin-Star Legend", 64, 341, 410],
  ["Nisha Rao", "nisha_algo", "Emerald Trailblazer", 9, 119, 185],
  ["Zoya Fernandes", "zoya_bits", "Stormforged", 196, 548, 700],
  ["Aditya Nair", "aditya_heap", "Azure Blade", 28, 203, 286],
  ["Priya Sethi", "priya_prefix", "Bonfire Vanguard", 16, 176, 248],
  ["Kabir Khan", "kabir_stack", "Twin-Star Legend", 64, 341, 410],
  ["Ishaan Sen", "ishaan_heap", "Cosmic Riftwalker", 224, 621, 760],
  ["Avni Gupta", "avni_greedy", "Sakura Eclipse", 58, 298, 380],
  ["Rohan Gill", "rohan_range", "Violet Coinmaster", 75, 367, 455],
  ["Myra Shah", "myra_matrix", "Gilded Sunbearer", 102, 489, 590],
  ["Neel Verma", "neel_numbers", "Crimson Ascendant", 143, 577, 690],
  ["Arjun Mehta", "arjun_dsa", "Azure Blade", 31, 227, 310],
  ["Veer Malhotra", "veer_graphs", "Gilded Sunbearer", 168, 503, 640],
  ["Rehan Qureshi", "rehan_peak", "Crimson Ascendant", 389, 812, 930],
  ["Aditi Jain", "aditi_dp", "Bonfire Vanguard", 22, 194, 275],
  ["Om Prakash", "om_queues", "Emerald Trailblazer", 47, 271, 360],
  ["Sara Dutta", "sara_sorting", "Stormforged", 86, 399, 510],
  ["Yash Batra", "yash_yields", "Cosmic Riftwalker", 98, 433, 565],
  ["Leena Roy", "leena_links", "Violet Coinmaster", 121, 524, 650],
  ["Nikhil Suri", "nikhil_nodes", "Twin-Star Legend", 73, 356, 445],
  ["Pooja Arora", "pooja_paths", "Sakura Eclipse", 137, 591, 720],
];

const getDifficulty = (solved, total) => {
  const easyTotal =
    Math.round(total * 0.38);
  const mediumTotal =
    Math.round(total * 0.45);
  const hardTotal =
    total - easyTotal - mediumTotal;

  const easySolved = Math.min(
    easyTotal,
    Math.round(solved * 0.42)
  );
  const mediumSolved = Math.min(
    mediumTotal,
    Math.round(solved * 0.43)
  );
  const hardSolved = Math.min(
    hardTotal,
    Math.max(
      solved - easySolved - mediumSolved,
      0
    )
  );

  return {
    Easy: {
      solved: easySolved,
      total: easyTotal,
    },
    Medium: {
      solved: mediumSolved,
      total: mediumTotal,
    },
    Hard: {
      solved: hardSolved,
      total: hardTotal,
    },
  };
};

const getAvatar = (name, index) => {
  const colors = [
    "ff8738",
    "38bdf8",
    "22c55e",
    "c084fc",
    "fef08a",
    "ffd700",
    "818cf8",
    "e879f9",
    "ff8fb1",
    "dc2626",
  ];

  return `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(
    name
  )}&backgroundColor=${
    colors[index % colors.length]
  }`;
};

const seed = async () => {
  const mongoUri = getMongoUri();

  if (!mongoUri) {
    throw new Error(
      "MONGO_URI or MONGO_URI_LOCAL is required"
    );
  }

  await mongoose.connect(mongoUri);

  const passwordHash =
    await bcrypt.hash(
      "DemoMate@123",
      10
    );

  const seedUsers = [];

  for (const [
    index,
    [
      name,
      username,
      milestone,
      streak,
      solved,
      total,
    ],
  ] of names.entries()) {
    const email = `${username}@mates.local`;

    const user =
      await User.findOneAndUpdate(
        {
          email,
        },
        {
          name,
          email,
          username,
          avatar: getAvatar(
            name,
            index
          ),
          passwordHash,
          isVerified: true,
          platformLinks: {
            leetcode:
              "https://leetcode.com",
            codeforces:
              "https://codeforces.com",
            codechef:
              "https://www.codechef.com",
            github: "https://github.com",
          },
          mateProfile: {
            milestone,
            streak,
            solved,
            total,
            difficulty:
              getDifficulty(
                solved,
                total
              ),
          },
        },
        {
          upsert: true,
          returnDocument: "after",
          setDefaultsOnInsert: true,
        }
      );

    seedUsers.push(user);
  }

  const realUsers = await User.find({
    email: {
      $not: /@mates\.local$/,
    },
    isVerified: true,
  });

  for (const realUser of realUsers) {
    for (const [
      index,
      seedUser,
    ] of seedUsers.entries()) {
      const status = statuses[index];

      await MateConnection.deleteMany({
        $or: [
          {
            requester: realUser._id,
            addressee: seedUser._id,
          },
          {
            requester: seedUser._id,
            addressee: realUser._id,
          },
        ],
      });

      if (status === "mate") {
        await MateConnection.create({
          requester: realUser._id,
          addressee: seedUser._id,
          status: "accepted",
        });
      } else if (
        status === "request"
      ) {
        await MateConnection.create({
          requester: seedUser._id,
          addressee: realUser._id,
          status: "pending",
        });
      } else {
        await MateConnection.create({
          requester: realUser._id,
          addressee: seedUser._id,
          status: "pending",
        });
      }
    }
  }

  console.log(
    `Seeded ${seedUsers.length} mate users and linked them to ${realUsers.length} existing users.`
  );

  await mongoose.disconnect();
};

seed().catch(async (error) => {
  console.error(error.message);
  await mongoose.disconnect();
  process.exit(1);
});
