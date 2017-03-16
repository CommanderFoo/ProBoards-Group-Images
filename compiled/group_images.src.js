class Group_Images {

	static init(){
		this.PLUGIN_ID = "pd_group_images";
		this.PLUGIN_KEY = "pd_group_images";

		this.group_images = new Map();

		this.setup();

		if(this.group_images.size > 0){
			$(this.ready.bind(this));
		}
	}

	static ready(){
		let location_check = (

			pb.data("route").name == "search_results" ||
			pb.data("route").name == "conversation" ||
			pb.data("route").name == "list_messages" ||
			pb.data("route").name == "thread" ||
			pb.data("route").name == "list_posts" ||
			pb.data("route").name == "permalink" ||
			pb.data("route").name == "all_recent_posts" ||
			pb.data("route").name == "recent_posts" ||
			pb.data("route").name == "posts_by_ip"

		);

		if(location_check){
			Group_Images_Mini_Profile.init();
		} else if(pb.data("route").name == "show_user_groups"){
			let member = pb.data("page").member;

			if(member && (member.id == pb.data("user").id || pb.data("user").is_staff)){
				let $table = $("table.groups.list");
				let $rows = $table.find("tr.group");

				if($table.length){
					$table.find("tr.heading").append("<th>Group Images</th>");
				}

				let data = pb.plugin.key(this.PLUGIN_KEY).get(member.id);

				if(!data){
					data = {};
				}

				$rows.each((idx, elem) => {
					let grp_id = elem.id.split("-")[1];
					let imgs = this.fetch_group_images(grp_id, data, false);

					$(elem).append("<td>" + imgs + "</td>");
				});

				$rows.find(".group-img-selectable").on("click", this.click_img);
			}
		}
	}

	static in_group($row){
		let $td = $row.find("td:first");
		let a = $td.find("a.leave-group, a.remove-from-group");

		if(a.length > 0 && a.css("display") != "none"){
			return true;
		}

		return false;
	}

	static click_img(){
		let $img = $(this);
		let key = pb.plugin.key(Group_Images.PLUGIN_KEY);
		let $row = $img.parent().parent();

		if(!pb.data("user").is_staff && !Group_Images.in_group($row)){
			return;
		}

		let grp_id = $row.attr("id").split("-")[1];
		let member = pb.data("page").member;
		let data = key.get(member.id);

		if(!data){
			data = {};
		}

		if(!data["_" + grp_id]){
			data["_" + grp_id] = [];
		}

		let img_indx = parseInt($img.attr("data-img-id"), 10);

		if($img.hasClass("group-img-selected")){
			$img.removeClass("group-img-selected");

			let index = $.inArrayLoose(img_indx, data["_" + grp_id]);

			if(index > - 1){
				data["_" + grp_id].splice(index, 1);
			}

			if(data["_" + grp_id].length == 0){
				delete data["_" + grp_id];
			}
		} else {
			$img.addClass("group-img-selected");

			if($.inArrayLoose(img_indx, data["_" + grp_id]) == -1){
				data["_" + grp_id].push($img.attr("data-img-id"));
			}
		}

		key.set({

			value: data,
			object_id: member.id

		});
	}

	static setup(){
		let plugin = pb.plugin.get(this.PLUGIN_ID);

		if(plugin && plugin.settings){
			let plugin_settings = plugin.settings;
			let group_images = plugin_settings.group_images;

			for(let i = 0, l = group_images.length; i < l; ++ i){
				for(let g = 0, gl = group_images[i].groups.length; g < gl; ++ g){
					let grp = group_images[i].groups[g].toString();

					if(!this.group_images.has(grp)){
						this.group_images.set(grp, []);
					}

					let imgs = this.group_images.get(grp);

					imgs.push(group_images[i].image_url);

					this.group_images.set(grp, imgs);
				}
			}
		}
	}

	static fetch_group_images(grp_id = 0, data = {}, return_array = false){
		let imgs = [];

		if(grp_id && this.group_images.has(grp_id.toString())){
			let images = this.group_images.get(grp_id.toString());
			let grp_data = (data["_" + grp_id])? data["_" + grp_id] : [];

			for(let g = 0, l = images.length; g < l; ++ g){
				let klass = (grp_data.length && $.inArrayLoose(g, grp_data) > - 1)? " group-img-selected" : "";

				if(return_array){
					if($.inArrayLoose(g, grp_data) > - 1){
						imgs.push(images[g]);
					}
				} else {
					imgs.push("<img data-img-id='" + g + "' class='group-img-selectable" + klass + "' src='" + images[g] + "' />");
				}
			}
		}

		return (return_array)? imgs : imgs.join("<br />");
	}

}

class Group_Images_Mini_Profile {

	static init(){
		this.add_group_images_to_mini_profile();

		pb.events.on("afterSearch", this.add_group_images_to_mini_profile.bind(this));
	}

	static add_group_images_to_mini_profile(){
		let $mini_profiles = $(".item .mini-profile");

		if(!$mini_profiles.length){
			return;
		}

		$mini_profiles.each((index, item) => {
			let $mini_profile = $(item);
			let $elem = $mini_profile.find(".group-images-mini-profile");
			let $user_link = $mini_profile.find("a.user-link[href*='user/']");
			let $info = $mini_profile.find(".info");

			if(!$elem.length && !$info.length){
				return;
			}

			if($user_link.length){
				let user_id_match = $user_link.attr("href").match(/\/user\/(\d+)\/?/i);

				if(!user_id_match || !parseInt(user_id_match[1], 10)){
					return;
				}

				let user_id = parseInt(user_id_match[1], 10);
				let using_info = false;

				if(!$elem.length){
					using_info = true;
					$elem = $("<div class='group-images-mini-profile'></div>");
				}

				let data = pb.plugin.key(Group_Images.PLUGIN_KEY).get(user_id);

				if(data){
					let user_grp_imgs = [];

					for(let group in data){
						if(data.hasOwnProperty(group)){
							let grp_id = parseInt(group.replace("_", ""), 10);
							let grp_imgs = Group_Images.fetch_group_images(grp_id, data, true);

							if(grp_imgs && grp_imgs.length){
								user_grp_imgs.push({

									id: grp_id,
									imgs: grp_imgs

								})
							}
						}
					}

					if(user_grp_imgs.length){
						let html = "";

						for(let i = 0, l = user_grp_imgs.length; i < l; ++ i){
							if(user_grp_imgs[i].imgs.length > 0){
								for(let g = 0, gl = user_grp_imgs[i].imgs.length; g < gl; ++ g){
									html += "<span class='group-img-item'><a href='/members?group=" + user_grp_imgs[i].id + "&view=group'><img src='" + user_grp_imgs[i].imgs[g] + "' /></a></span>";
								}
							}
						}

						$elem.html(html);

						if(using_info){
							$info.append($elem);
						}
					}
				}
			}

		});
	}

};

Group_Images.init();