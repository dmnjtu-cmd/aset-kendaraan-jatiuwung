create table if not exists public.kendaraan(
 id uuid primary key default gen_random_uuid(),
 jenis_kendaraan text not null check(jenis_kendaraan in ('Mobil','Motor','Bentor')),
 nomor_polisi text not null unique,
 nama_pemegang text not null,
 merk_tipe text,
 tahun_pengadaan integer,
 nomor_rangka text,
 nomor_mesin text,
 tanggal_perpanjangan date,
 tanggal_ganti_kaleng date,
 created_at timestamptz default now()
);
alter table public.kendaraan enable row level security;
create policy "authenticated read" on public.kendaraan for select to authenticated using(true);
create policy "authenticated insert" on public.kendaraan for insert to authenticated with check(true);
create policy "authenticated update" on public.kendaraan for update to authenticated using(true) with check(true);
create policy "authenticated delete" on public.kendaraan for delete to authenticated using(true);
