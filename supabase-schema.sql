-- Supabase에서 실행할 SQL 스크립트
-- 이 스크립트를 Supabase Dashboard의 SQL Editor에서 실행하세요

-- reservations 테이블 생성
CREATE TABLE IF NOT EXISTS public.reservations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 인덱스 생성 (성능 향상)
CREATE INDEX IF NOT EXISTS idx_reservations_date ON public.reservations(date);
CREATE INDEX IF NOT EXISTS idx_reservations_date_time ON public.reservations(date, start_time);

-- RLS (Row Level Security) 활성화
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 예약을 조회할 수 있도록 정책 설정
CREATE POLICY "Anyone can view reservations" ON public.reservations
    FOR SELECT USING (true);

-- 모든 사용자가 예약을 생성할 수 있도록 정책 설정
CREATE POLICY "Anyone can create reservations" ON public.reservations
    FOR INSERT WITH CHECK (true);

-- 선택적: 예약 생성자만 삭제할 수 있도록 하려면 (현재는 삭제 기능 없음)
-- CREATE POLICY "Users can delete own reservations" ON public.reservations
--     FOR DELETE USING (auth.uid() = user_id);

-- 테이블 권한 설정
GRANT ALL ON public.reservations TO anon;
GRANT ALL ON public.reservations TO authenticated;

-- 실시간 구독 활성화
ALTER PUBLICATION supabase_realtime ADD TABLE public.reservations;