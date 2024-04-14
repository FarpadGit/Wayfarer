import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function seed() {
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();
  const admin = await prisma.user.create({
    data: { id: "WF_ADMIN", name: "Admin" },
  });
  const guest = await prisma.user.create({
    data: { id: "WF_GUEST", name: "Guest" },
  });

  const post1 = await prisma.post.create({
    data: {
      title: "Üdv a Wayfarer-en 👋",
      body: `Légy üdvözölve, vándor!
      
Fabók Árpád webfejlesztő vagyok, és ez az oldal egy afféle hobbi projekt amivel meg akartam tanítani magamnak az Angular 17-et. 
Lényegében egy Reddithez hasonló beágyazott komment és tartalom értékelő oldal ami egy szerver oldali Postgres adatbázisban tárolja a bejegyzéseket, és ha Google fiókoddal bejelentkezel akkor írhatsz saját posztokat is, illetve hagyhatsz megjegyzéseket mások írásain. 
(Ez a bejelentkezés nem kötelező, aki inkább nem szeretne ilyen módon belépni az is használhatja a közösen megosztott vendég fiókot ugyanezen célokra, csak ehhez mindenkinek hozzáférése van és bárki felülírhatja amit csináltál.)`,
      uploaderId: admin.id,
    },
  });

  const comment1_1 = await prisma.comment.create({
    data: {
      message: `Ezeken kívül tudsz még kommenteket lájkolni, írni, szerkeszteni, törölni, összecsukni beágyazott komment fákat a tőlük balra lévő vonalra kattintva, vagy írni egy új posztot a főoldalon keresztül. Szerintem viszonylag magától érthetődő a legtöbb rész de ha kérdésed van ne tartsalak vissza :)`,
      userId: admin.id,
      postId: post1.id,
    },
  });

  const comment1_2 = await prisma.comment.create({
    data: {
      message: `Bejelentkezni a jobb felső sarokban található gombon keresztül lehet, és minden újonnan validált Google fiók email címe elmentésre kerül az adatbázisban.
Aki ezt nem szeretné és csak kipróbálná hogy melyik gomb mit csinál az nyugodtan maradhat a vendég fióknál, alapértelmezetten ide vagy bejelentkezve.`,
      userId: admin.id,
      postId: post1.id,
    },
  });

  const comment1_3 = await prisma.comment.create({
    data: {
      parentId: comment1_2.id,
      message:
        "Bejelentkezett felhasználók írásait azonban mások nem törölhetik, szerkeszthetik illetve a like-jaikat nem változtathatják. Csak én. Nekem mindent szabad 😏.",
      userId: admin.id,
      postId: post1.id,
    },
  });

  const post2 = await prisma.post.create({
    data: {
      title: "Szóval hogyan is működik ez?",
      body: `Maga a frontend oldal (amit most látsz) Angular 17 keretrendszerrel készült ami TypeScript 5.3 és SCSS stíluslapokat használ. A szerver oldal ami az adatbázissal kommunikál és fogadja a kéréseket egy Node.js-ben írt REST API ami egy Fastify nevű web keretrendszerre épül. Az adatbázis integráció Prisma-n keresztül történik. 
Ez a szerver minden kliens oldali kérés válaszához egy cookie-t csatol amivel azonosítja a felhasználót aki a kérést intézte (vendég vagy bejelentkezett). Ez alapján tudja a böngésző összehasonlítani, hogy pl. az adott poszt szerzője van-e bejelentkezve.`,
      uploaderId: admin.id,
    },
  });

  const comment2_1 = await prisma.comment.create({
    data: {
      message:
        "Amikor létrehozol egy új kommentet (vagy szerkeszted vagy törlöd, stb.) ezt a kérést aszinkron módon elküldi a szervernek, majd a böngészőben azonnal elvégzi a változást anélkül, hogy újra lekérdezné az adatbázist. Új posztok létrehozásakor ez kicsit másképp van, akkor valóban kér egy frissítést a szervertől és újra lekérdezi a posztok listáját miután a beszúrás megtörtént. Ez főleg a listanézet lapozhatóságát szolgálja. (a jelenlegi beállítás, hogy 6 posztot látsz oldalanként.)",
      userId: admin.id,
      postId: post2.id,
    },
  });

  const post3 = await prisma.post.create({
    data: {
      title: "Ez az izé mozog!",
      body: `Csinos kis animáció, ugye? Kár, hogy egy kisebb állapotgépet kellett összeraknom érte. (Kulcsszó a 'kisebb'. Szerencsére Redux/NgRx-nél még nem tartunk.) 
A trükk abban rejlik, hogy minden HTML elemnek van egy onAnimationEnd eseménye, amit akkor süt el ha egy stíluslapban definiált animációja befejezte a lejátszását. Ha ezen eseményhez hozzáadunk egy callback metódust akkor egy tetszőlegesen hosszú, eszterláncba kötött animációsorozatot tudunk létrehozni. Csak arra érdemes ügyelni hogy lehetőleg mindig egy másik, még nem animált elem osztályát változtassuk meg következő lépésként.`,
      uploaderId: admin.id,
    },
  });

  const comment3_1 = await prisma.comment.create({
    data: {
      message: `Ja, és az a hosszú animáció amiben összecsukódnak meg legördülnek a dolgok csak egyszer játszódik le. A továbbiakban egy rövidített elhomályosodás veszi át a helyét, hogy ne lehessen olyan hamar megunni. Ha még egyszer akarod látni akkor frissítened kell az oldalt.`,
      userId: admin.id,
      postId: post3.id,
    },
  });

  const comment3_2 = await prisma.comment.create({
    data: {
      message: `Maga a banner/háttérkép amit animálni látsz egy külön komponens amit egy saját service mozgat állapotok közti lépkedésekkel. Még egy callback listája is van amibe más komponensek regisztrálhatnak saját logikát, hogy azok lefutásra kerüljenek amikor az adott állapotba kerül.`,
      userId: admin.id,
      postId: post3.id,
    },
  });

  const comment3_3 = await prisma.comment.create({
    data: {
      parentId: comment3_2.id,
      message: `Sőt, még az oldalak közti tranzíciót is egy állapotgép irányítja, mivel elnavigáláskor először szépen megvárja hogy az új oldal háttérképe teljesen betöltődjön (meghívja az onLoad eseményt) és csak utána lép tovább. 
Amíg ez nem történik meg addig kitartja a banner képet mint afféle betöltés indikátort és nem vált oldalt. (Az új háttérképet egy külön <img> tag foglalja magában a komponensben, csak néha rejtve marad hogy a banner kép legyen látható.)`,
      userId: admin.id,
      postId: post3.id,
    },
  });

  const comment3_4 = await prisma.comment.create({
    data: {
      parentId: comment3_3.id,
      message: `(Beismerem, hogy SEO szempontokból ez a megoldás valószínűleg nem nagyon lenne szimpatikus a crawlereknek, de most ezt nem is akartam, hogy szempont legyen.)`,
      userId: admin.id,
      postId: post3.id,
    },
  });

  const post4 = await prisma.post.create({
    data: {
      title: "Egyéb függőségek",
      body: `A szervernek küldött kéréseket az Axios könyvtárcsomagon keresztül intézi a weboldal. A felugró ablakokhoz (bár inkább "leugró" mind a kettő) egy ngx-modal-ease nevű csomagot használ, a poszt lista lapozhatóvá tételéhez ngx-pagination-t, illetve a Google fiókos bejelentkezésért az angular-oauth2-oidc nevű csomag felel. 
Ezeken túl még egy ngx-linky nevű könyvtárat is használ ami automatikusan linkekké változtatja a posztokban szereplő email címeket, weboldal url-eket, stb., valamint egyéb kisebb ikonok is be lettek importálva az ng-icons könyvtárból.`,
      uploaderId: admin.id,
    },
  });

  const comment4_1 = await prisma.comment.create({
    data: {
      message: `A Google beléptetéshez eredetileg az abacritt féle angularx-social-login könyvtárral próbálkoztam mivel az első visszajelzések szerint ez a közkedvelt megoldás erre a feladatra. Azonban mint kiderült ennek a csomagnak van egy olyan kisebb szépséghibája (bug?), hogy az oldal újratöltésekor elveszik a bejelentkezési token és a felhasználónak újra be kell lépnie a Google fiókjába, így áttértem egy robosztusabb megoldásra.`,
      userId: admin.id,
      postId: post4.id,
    },
  });

  const post5 = await prisma.post.create({
    data: {
      title: "Névjegy",
      body: `Fabók Árpád informatikus vagyok, az email címem farpadmail@gmail.com. Mint webfejlesztő ismerős vagyok többek közt React, NextJs, Angular 2+, TypeScript, CSS, SCSS valamint egyéb fejlesztői technológiákkal (komponens és animációs könyvtárak, tailwind, zod, stb.). És néha a szabadidőmben ilyen projekteket csinálok a saját jobb belátásom ellenére.`,
      uploaderId: admin.id,
    },
  });
}

seed();
