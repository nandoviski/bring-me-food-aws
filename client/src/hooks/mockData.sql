
INSERT INTO "User" ("id","email","clerkId","status","createdAt","updatedAt") 
VALUES ('879c31a3-5354-49ed-be60-8ab4b00c9537','sarah@example.com','clerk_chef54564564','CREATED','2025-04-08 00:00:00','2025-04-08 00:00:00');

INSERT INTO "Chef"("id","username","name","location","bio","specialties","userId","updatedAt","createdAt") 
VALUES ('d6a8e654-a4ee-4c45-8f3b-11f037981496','sarah_kitchen','My Home Kitchen','Burwood, NSW','I am a chef with 10 years of experience in the kitchen. I love to cook and share my passion for food with others.','Italian, French, Asian','879c31a3-5354-49ed-be60-8ab4b00c9537','2025-04-08 00:00:00','2025-04-08 00:00:00');

INSERT INTO "User" ("id","email","clerkId","status","createdAt","updatedAt")
VALUES ('eacc7be0-860d-450e-a4d4-4b069fb9cd47','fmarostega@gmail.com','clerk_1234567890','CREATED','2025-04-08 00:00:00','2025-04-08 00:00:00');

INSERT INTO "Customer"("id","firstName","lastName","address","phoneNumber","city","state","country","postalCode","updatedAt","createdAt","userId")
VALUES ('873d1e0e-16e0-49f9-a0a5-c1947cf0e272','Fernando','Marostega','123 Main St','0455555555','Rhodes','NSW','AU','2038','2025-04-08 00:00:00','2025-04-08 00:00:00','eacc7be0-860d-450e-a4d4-4b069fb9cd47');
