 admin\admin_dashboard.html এ অনেকগুলো টেবিলের পরিবর্তে ১টি টেবিল ব্যবহার করা হয়েছে।
 টেবিলের পরিবর্তে সেকশন ব্যবহার করা হয়েছে। টেবিলের পরিবর্তে সেকশন ব্যবহার করে  সাজাও ও ডিজাইন কর।। 


 table public.kabirdatabase (
  image_iid bigint null,
  created_at timestamp with time zone null,
  title text null,
  description text null,
  section text null,
  image_url text null,
  thumbnail_url text null,
) TABLESPACE pg_default;

section >> (Dropdown হবে)
bangla_quotes_1, bangla_quotes_2, bangla_quotes_3, bangla_quotes_4, photography_1, photography_2, illustration_1, illustration_2, english_quote_1, english_quote_2, story_1, story_2, story_3 


image_url > মূল ফাইল (মূল ফাইল আপলোড করবে)
thumbnail_url > thumbnail ফাইল (১০০ kb এর মধ্যে কমপ্রেস করে আপলোড করবে)

