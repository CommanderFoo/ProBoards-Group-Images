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

	static click_img(){
		let $img = $(this);
		let key = pb.plugin.key(Group_Images.PLUGIN_KEY);
		let $row = $img.parent().parent();
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