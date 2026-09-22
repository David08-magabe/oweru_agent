-- Minimal sample data — just enough for list_service_areas to have
-- something to report. Real region data would come from the full
-- assistant's shared property database in production.

INSERT INTO properties (reference_code, title, property_type, listing_type, region, neighborhood, status)
VALUES
    ('OWR-1001', 'Sample listing', 'apartment', 'rent', 'Dar es Salaam', 'Masaki', 'available'),
    ('OWR-1002', 'Sample listing', 'apartment', 'rent', 'Dar es Salaam', 'Mikocheni', 'available'),
    ('OWR-1003', 'Sample listing', 'house', 'sale', 'Dar es Salaam', 'Mbezi Beach', 'available'),
    ('OWR-1006', 'Sample listing', 'land', 'sale', 'Dar es Salaam', 'Kigamboni', 'available');

INSERT INTO company_info (about_text, services)
VALUES (
    'Oweru ilianzishwa 2023 kwa kuingia kwenye soko la ardhi Tanzania, ikitambua kuwa wengi wanaota kumiliki ardhi na kujenga nyumba lakini malipo ya fedha taslimu kamili yalifanya ndoto hiyo ionekane mbali. Mwaka 2024, Oweru ilipanua huduma zake na kuwa jukwaa la kukodi mali linalokua kwa kasi zaidi Afrika, likileta uwazi, ufanisi, na usalama kwenye mchakato mzima wa kukodi.',
    ARRAY[
        'Mjengo Challenge — mpango wa kununua kiwanja na kujenga nyumba kwa michango midogo ya kila mwezi badala ya malipo makubwa ya mara moja, ukiwa na hatua zinazoeleweka na kufuatiliwa kwa urahisi ("Anza kidogo, maliza kikubwa")',
        'Kukodi nyumba na mali — jukwaa linalounganisha wapangaji na wamiliki/mawakala wa kuaminika, likiwa na mfumo wa uthibitishaji na ufuatiliaji unaojenga uaminifu',
        'Huduma kwa mawakala wa mali — mfumo wa ufuatiliaji unaohakikisha mawakala wanatambuliwa na kulipwa kwa kazi yao',
        'Kuunganisha wataalamu/mafundi wa ujenzi na fursa za kazi kupitia Oweru Works'
    ]
);
