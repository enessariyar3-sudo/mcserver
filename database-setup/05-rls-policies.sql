-- Row Level Security Policies

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (TRUE);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- User roles policies
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles"
  ON public.user_roles FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update roles"
  ON public.user_roles FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
  ON public.user_roles FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- Products policies
CREATE POLICY "Everyone can view active products"
  ON public.products FOR SELECT
  USING (is_active = TRUE OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage products"
  ON public.products FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Cart items policies
CREATE POLICY "Users can view their own cart items"
  ON public.cart_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cart items"
  ON public.cart_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cart items"
  ON public.cart_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cart items"
  ON public.cart_items FOR DELETE
  USING (auth.uid() = user_id);

-- Orders policies
CREATE POLICY "Users can view their own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Order items policies
CREATE POLICY "Users can view their own order items"
  ON public.order_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND orders.user_id = auth.uid()
  ));

-- Payment gateways policies
CREATE POLICY "Everyone can view active payment gateways"
  ON public.payment_gateways FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Admins can manage payment gateways"
  ON public.payment_gateways FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Payment transactions policies
CREATE POLICY "Users can view their own transactions"
  ON public.payment_transactions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all transactions"
  ON public.payment_transactions FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role inserts transactions"
  ON public.payment_transactions FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Service role updates transactions"
  ON public.payment_transactions FOR UPDATE
  USING (TRUE)
  WITH CHECK (TRUE);

-- News articles policies
CREATE POLICY "Everyone can view published articles"
  ON public.news_articles FOR SELECT
  USING (is_published = TRUE);

CREATE POLICY "Authors can manage their own articles"
  ON public.news_articles FOR ALL
  USING (auth.uid() = author_id);

CREATE POLICY "Admins can manage all articles"
  ON public.news_articles FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Gallery policies
CREATE POLICY "Everyone can view approved gallery items"
  ON public.gallery FOR SELECT
  USING (is_approved = TRUE);

CREATE POLICY "Users can manage their own gallery items"
  ON public.gallery FOR ALL
  USING (auth.uid() = author_id);

CREATE POLICY "Admins can manage all gallery items"
  ON public.gallery FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Server events policies
CREATE POLICY "Everyone can view active events"
  ON public.server_events FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Event creators can manage their events"
  ON public.server_events FOR ALL
  USING (auth.uid() = created_by);

CREATE POLICY "Admins can manage all events"
  ON public.server_events FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Event participants policies
CREATE POLICY "Users can view event participants"
  ON public.event_participants FOR SELECT
  USING (TRUE);

CREATE POLICY "Users can manage their own participation"
  ON public.event_participants FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all participants"
  ON public.event_participants FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Achievements policies
CREATE POLICY "Everyone can view active achievements"
  ON public.achievements FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Admins can manage achievements"
  ON public.achievements FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- User achievements policies
CREATE POLICY "Users can view their own achievements"
  ON public.user_achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Everyone can view user achievements for leaderboards"
  ON public.user_achievements FOR SELECT
  USING (TRUE);

CREATE POLICY "System can insert user achievements"
  ON public.user_achievements FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Admins can manage all user achievements"
  ON public.user_achievements FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Leaderboards policies
CREATE POLICY "Everyone can view active leaderboards"
  ON public.leaderboards FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Admins can manage leaderboards"
  ON public.leaderboards FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Player statistics policies
CREATE POLICY "Users can view their own statistics"
  ON public.player_statistics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Everyone can view statistics for leaderboards"
  ON public.player_statistics FOR SELECT
  USING (TRUE);

CREATE POLICY "Users can update their own statistics"
  ON public.player_statistics FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert statistics"
  ON public.player_statistics FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Admins can manage all statistics"
  ON public.player_statistics FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Tutorials policies
CREATE POLICY "Everyone can view published tutorials"
  ON public.tutorials FOR SELECT
  USING (is_published = TRUE);

CREATE POLICY "Authors can manage their own tutorials"
  ON public.tutorials FOR ALL
  USING (auth.uid() = author_id);

CREATE POLICY "Admins can manage all tutorials"
  ON public.tutorials FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Tutorial steps policies
CREATE POLICY "Everyone can view tutorial steps"
  ON public.tutorial_steps FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM tutorials
    WHERE tutorials.id = tutorial_steps.tutorial_id
    AND tutorials.is_published = TRUE
  ));

CREATE POLICY "Tutorial authors can manage their steps"
  ON public.tutorial_steps FOR ALL
  USING (EXISTS (
    SELECT 1 FROM tutorials
    WHERE tutorials.id = tutorial_steps.tutorial_id
    AND tutorials.author_id = auth.uid()
  ));

CREATE POLICY "Admins can manage all tutorial steps"
  ON public.tutorial_steps FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Support tickets policies
CREATE POLICY "Users can view their own tickets"
  ON public.support_tickets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all tickets"
  ON public.support_tickets FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create their own tickets"
  ON public.support_tickets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tickets"
  ON public.support_tickets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can update all tickets"
  ON public.support_tickets FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

-- RCON servers policies
CREATE POLICY "Super admins can manage RCON servers"
  ON public.rcon_servers FOR ALL
  USING (EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'::app_role
    AND user_roles.created_at < NOW() - INTERVAL '24 hours'
  ));

-- RCON audit log policies
CREATE POLICY "Admins can view all RCON logs"
  ON public.rcon_audit_log FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert RCON logs"
  ON public.rcon_audit_log FOR INSERT
  WITH CHECK (TRUE);

-- RCON access log policies
CREATE POLICY "Super admins can view RCON access logs"
  ON public.rcon_access_log FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'::app_role
  ));

CREATE POLICY "System can insert RCON access logs"
  ON public.rcon_access_log FOR INSERT
  WITH CHECK (TRUE);

-- RCON password access attempts policies
CREATE POLICY "Admins can view password access attempts"
  ON public.rcon_password_access_attempts FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'::app_role
  ));

CREATE POLICY "System can insert password access attempts"
  ON public.rcon_password_access_attempts FOR INSERT
  WITH CHECK (TRUE);

-- Site settings policies
CREATE POLICY "Everyone can view site settings"
  ON public.site_settings FOR SELECT
  USING (TRUE);

CREATE POLICY "Admins can manage site settings"
  ON public.site_settings FOR ALL
  USING (has_role(auth.uid(), 'admin'));
